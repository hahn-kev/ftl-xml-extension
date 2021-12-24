import {FtlParser} from './ftl-parser';
import {FltDocumentValidator} from './flt-document-validator';
import {FileType, RelativePattern, Uri, workspace, WorkspaceFolder} from 'vscode';
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

  async parseWorkspace(subFolder?: string) {
    const files = await this.findFiles(subFolder);
    const root = await this.xmlParser.parseFiles(files, true);
    this.validator.validateFtlRoot(root);
    return this.xmlParser.root;
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

  async workspaceFoldersAdded(folders: readonly WorkspaceFolder[]) {
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
    this.validator.validateFtlRoot(this.xmlParser.root);
  }
}
