import {Uri} from 'vscode';

export class SoundFile {
  constructor(uri: Uri) {
    this.uri = uri;
    const pathArray = this.uri.path.split('/');
    const audioIndex = pathArray.lastIndexOf('audio');
    const typeIndex = audioIndex + 1;
    this.modPath = pathArray.slice(typeIndex + 1).join('/');
    this.type = pathArray[typeIndex] === 'music' ? 'music' : 'wave';
  }

  public uri: Uri;
  public type: 'wave'|'music';
  public modPath: string;

  public matches(path: string): boolean {
    // todo will match the full path, should only match starting with folder after 'waves' folder
    return this.modPath.endsWith(path);
  }
}
