import {FtlParser} from './ftl-parser';
import {FltDocumentValidator} from './flt-document-validator';
import {RelativePattern, workspace, WorkspaceFolder} from 'vscode';
import {FtlDatFs} from './fs-provider-sample/ftl-dat-fs';
import {FtlDatCache} from './fs-provider-sample/ftl-dat-cache';

export class WorkspaceParser {
  get isParsing() {
    return this.xmlParser.isParsing;
  }

  constructor(public xmlParser: FtlParser,
              private validator: FltDocumentValidator,
              private ftlDatCache: FtlDatCache) {
  }

  async parseWorkspace() {
    const files = await this.xmlParser.parseCurrentWorkspace();
    this.validator.validateFtlFiles(Array.from(files.values()));
    return this.xmlParser.root;
  }

  async parseWorkspaceFolders(folders: readonly WorkspaceFolder[]) {
    for (const folder of folders) {
      if (folder.uri.scheme === FtlDatFs.scheme) {
        await this.ftlDatCache.tryAdd(folder.uri);
      }
      const pattern = new RelativePattern(folder, '**/*.{xml,xml.append}');
      const files = await workspace.findFiles(pattern);
      await this.xmlParser.parseFiles(files);
      await this.validator.validateFiles(files);
    }
  }
}
