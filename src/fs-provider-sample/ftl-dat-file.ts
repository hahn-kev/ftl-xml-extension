import {Uri} from 'vscode';
import {Directory} from './directory';
import {File} from './file';
import {DatFileParser} from './dat-file-parser';

export class FtlDatFile extends Directory {
  constructor(workspaceFolder: Uri) {
    super('ftl.dat');
    this.entries = new DatFileParser().parse(workspaceFolder);
  }

  static relativeToDat(file: Uri): string {
    const parts = file.path.split('/');
    const indexOfDat = this.indexOfDat(parts);
    return parts.slice(indexOfDat + 1).join('/');
  }

  static asDat(file: Uri): Uri | undefined {
    const parts = file.path.split('/');
    const indexOfDat = this.indexOfDat(parts);
    if (indexOfDat > 0) {
      return file.with({path: parts.slice(0, indexOfDat + 1).join('/')});
    }
  }

  static indexOfDat(pathParts: string[]) {
    let i;
    for (i = pathParts.length - 1; i >= 0; i--) {
      const part = pathParts[i];
      if (part.endsWith('.dat')) {
        return i;
      }
    }
    return -1;
  }
}
