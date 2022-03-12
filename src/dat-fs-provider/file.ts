import {FileStat, FileType} from 'vscode-html-languageservice';


export class File implements FileStat {
  type: FileType.File = FileType.File;
  ctime: number;
  mtime: number;
  size: number;
  // 1 means readonly
  permissions = 1;

  name: string;
  data?: Uint8Array;

  constructor(name: string) {
    this.ctime = Date.now();
    this.mtime = Date.now();
    this.size = 0;
    this.name = name;
  }
}
