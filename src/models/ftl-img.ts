import {Uri} from 'vscode';

export class FtlImg {
  constructor(uri: Uri) {
    this.uri = uri;
    const pathArray = this.uri.path.split('/');
    const imgIndex = pathArray.lastIndexOf('img');
    this.modPath = pathArray.slice(imgIndex + 1).join('/');
  }

  public uri: Uri;
  public modPath: string;

  public matches(path: string): boolean {
    return this.modPath.endsWith(path);
  }
}
