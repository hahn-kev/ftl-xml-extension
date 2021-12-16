import {Uri} from 'vscode';
import {FtlResourceFile} from './ftl-resource-file';

export class SoundFile extends FtlResourceFile {
  constructor(uri: Uri) {
    const pathArray = uri.path.split('/');
    const audioIndex = pathArray.lastIndexOf('audio');
    const typeIndex = audioIndex + 1;
    super(uri, pathArray.slice(typeIndex + 1).join('/'));

    this.type = pathArray[typeIndex] === 'music' ? 'music' : 'wave';
  }

  public type: 'wave' | 'music';

  public matches(path: string): boolean {
    // todo will match the full path, should only match starting with folder after 'waves' folder
    return this.modPath.endsWith(path);
  }
}
