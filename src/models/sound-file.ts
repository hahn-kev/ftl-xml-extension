import {URI} from 'vscode-uri';
import {FtlResourceFile} from './ftl-resource-file';

export class SoundFile extends FtlResourceFile {
  constructor(uri: URI) {
    const pathArray = uri.path.split('/');
    const audioIndex = pathArray.lastIndexOf('audio');
    const typeIndex = audioIndex + 1;
    super(uri, pathArray.slice(typeIndex + 1).join('/'));

    this.type = pathArray[typeIndex] === 'music' ? 'music' : 'wave';
  }

  public type: 'wave' | 'music';
}
