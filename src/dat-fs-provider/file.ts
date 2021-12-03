import vscode from 'vscode';

export class File implements vscode.FileStat {
  type: vscode.FileType.File = vscode.FileType.File;
  ctime: number;
  mtime: number;
  size: number;
  permissions = vscode.FilePermission.Readonly;

  name: string;
  data?: Uint8Array;

  constructor(name: string) {
    this.ctime = Date.now();
    this.mtime = Date.now();
    this.size = 0;
    this.name = name;
  }
}
