import {FtlFile} from './ftl-file';
import {Uri} from 'vscode';

export class FtlRoot {
  constructor() {
    this.files = new Map<string, FtlFile>();
  }

  files: Map<string, FtlFile>;
  soundFiles: Uri[] = [];
}
