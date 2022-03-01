import {FilePermission, FileStat, FileType} from 'vscode';

export class File implements FileStat {
  type: FileType.File = FileType.File;
  ctime: number;
  mtime: number;
  size: number;
  permissions = FilePermission.Readonly;

  name: string;
  data?: Uint8Array;

  constructor(name: string) {
    this.ctime = Date.now();
    this.mtime = Date.now();
    this.size = 0;
    this.name = name;
  }
}
