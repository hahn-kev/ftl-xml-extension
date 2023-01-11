import {URI} from 'vscode-uri';

export class FtlResourceFile {
  constructor(uri: URI, modPath: string) {
    this.uri = uri;
    this.modPath = modPath;
  }

  public uri: URI;
  public modPath: string;

  static builder(modPathSelector: (uri: URI) => string): { new(file: URI): FtlResourceFile } {
    return class extends FtlResourceFile {
      constructor(uri: URI) {
        super(uri, modPathSelector(uri));
      }
    };
  }
}
