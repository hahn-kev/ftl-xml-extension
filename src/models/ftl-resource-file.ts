import {URI} from 'vscode-uri';

export class FtlResourceFile {
  constructor(uri: URI, modPath: string) {
    this.uri = uri;
    this.modPath = modPath;
  }

  public uri: URI;
  public modPath: string;
}
