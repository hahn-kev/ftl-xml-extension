import {Uri} from 'vscode';

export class FtlResourceFile {
  constructor(uri: Uri, modPath: string) {
    this.uri = uri;
    this.modPath = modPath;
  }

  public uri: Uri;
  public modPath: string;
}
