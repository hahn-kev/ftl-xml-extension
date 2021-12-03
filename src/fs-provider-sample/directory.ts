import vscode from 'vscode';
import {File} from './file';

export class Directory implements vscode.FileStat {
  type: vscode.FileType.Directory = vscode.FileType.Directory;
  ctime: number;
  mtime: number;
  size: number;

  name: string;
  entries: Map<string, File | Directory>;

  constructor(name: string) {
    this.ctime = Date.now();
    this.mtime = Date.now();
    this.size = 0;
    this.name = name;
    this.entries = new Map();
  }
}
