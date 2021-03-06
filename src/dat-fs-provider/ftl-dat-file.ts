import {URI} from 'vscode-uri';
import {Directory} from './directory';

export class FtlDatFile extends Directory {
  public uri: URI;
  constructor(workspaceFolder: URI) {
    super('ftl.dat');
    this.uri = workspaceFolder;
  }

  static relativeToDat(file: URI): string {
    const parts = file.path.split('/');
    const indexOfDat = this.indexOfDat(parts);
    return parts.slice(indexOfDat + 1).join('/');
  }

  static getDatUri(file: URI): URI | undefined {
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
