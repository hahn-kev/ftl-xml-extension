import {FtlParser} from './ftl-parser';
import {FltDocumentValidator} from './flt-document-validator';
import {RelativePattern, workspace, WorkspaceFolder} from 'vscode';

export class WorkspaceParser {
  get isParsing() {
    return this.xmlParser.isParsing;
  }
  constructor(private xmlParser: FtlParser, private validator: FltDocumentValidator) {
  }

  async parseWorkspace() {
    const files = await this.xmlParser.parseCurrentWorkspace();
    this.validator.validateFtlFiles(Array.from(files.values()));
  }

  async parseWorkspaceFolders(folders: readonly WorkspaceFolder[]) {
    for (const folder of folders) {
      const pattern = new RelativePattern(folder, '**/*.{xml,xml.append}');
      const files = await workspace.findFiles(pattern);
      await this.xmlParser.parseFiles(files);
      await this.validator.validateFiles(files);
    }
  }
}
