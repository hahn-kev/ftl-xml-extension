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

  static readonly findPattern = '**/*.{xml,xml.append,ogg,wav,png}';

  private async findFiles(subFolder?: string): Promise<Uri[]> {
    const prefix = subFolder ? `${subFolder}/` : '';
    const files = await workspace.findFiles(prefix + WorkspaceParser.findPattern);
    const datWorkspaces = workspace.workspaceFolders?.filter((f) => f.uri.scheme === FtlDatFs.scheme) ?? [];
    const datFilesList = await Promise.all(datWorkspaces.map((datWorkspace) => this.listFiles(datWorkspace.uri)));
    return files.concat(...datFilesList);
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
