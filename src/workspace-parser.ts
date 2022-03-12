import {FtlParser} from './ftl-parser';
import {FltDocumentValidator} from './flt-document-validator';
import {FileType, ProgressLocation, RelativePattern, Uri, window, workspace, WorkspaceFolder} from 'vscode';
import {FtlDatFs} from './dat-fs-provider/ftl-dat-fs';
import {FtlDatCache} from './dat-fs-provider/ftl-dat-cache';

export class WorkspaceParser {
  get isParsing() {
    return this.xmlParser.isParsing;
  }

  constructor(public xmlParser: FtlParser,
              private validator: FltDocumentValidator,
              private ftlDatCache: FtlDatCache) {
  }

  public async parseWorkspace(subFolder?: string) {
    const root = await this.execInParsing(async () => {
      const files = await this.findFiles(subFolder);
      return await this.xmlParser.parseFiles(files, true);
    });
    this.validator.validateFtlRoot(root);
    return this.xmlParser.root;
  }

  private async execInParsing<T>(exec: () => Promise<T>): Promise<T> {
    return window.withProgress({
      title: 'Parsing FTL files',
      location: ProgressLocation.Window
    }, exec);
  }

  public static readonly findPattern = '**/*.{xml,xml.append,ogg,wav,png}';

  private async findFiles(subFolder?: string): Promise<Uri[]> {
    if (subFolder) {
      const prefix = `${subFolder}/`;
      return await workspace.findFiles(prefix + WorkspaceParser.findPattern);
    }
    if (!workspace.workspaceFolders) return [];

    const files: Uri[] = [];
    for (const folder of workspace.workspaceFolders) {
      if (folder.uri.scheme === FtlDatFs.scheme) {
        await this.ftlDatCache.tryAdd(folder.uri);
        files.push(...await this.listFiles(folder.uri));
      } else {
        const pattern = new RelativePattern(folder, WorkspaceParser.findPattern);
        files.push(...await workspace.findFiles(pattern));
      }
    }
    return files;
  }

  private async listFiles(dir: Uri): Promise<Uri[]> {
    const results = await workspace.fs.readDirectory(dir);
    const files: Uri[] = [];
    for (const [fileName, type] of results) {
      const uri = dir.with({path: `${dir.path}/${fileName}`});
      if (type == FileType.File) {
        files.push(uri);
      } else {
        files.push(...await this.listFiles(uri));
      }
    }
    return files;
  }

  public async workspaceFoldersAdded(folders: readonly WorkspaceFolder[]) {
    await this.execInParsing(async () => {
      for (const folder of folders) {
        let files: Uri[];
        if (folder.uri.scheme === FtlDatFs.scheme) {
          await this.ftlDatCache.tryAdd(folder.uri);
          files = await this.listFiles(folder.uri);
        } else {
          const pattern = new RelativePattern(folder, WorkspaceParser.findPattern);
          files = await workspace.findFiles(pattern);
        }

        await this.xmlParser.parseFiles(files, false);
      }
    });

    this.validator.validateFtlRoot(this.xmlParser.root);
  }
}
