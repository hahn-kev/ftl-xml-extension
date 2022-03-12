import {URI} from 'vscode-uri';
import {FtlResourceFile} from './ftl-resource-file';

export class FtlImg extends FtlResourceFile {
  constructor(uri: URI) {
    const pathArray = uri.path.split('/');
    const imgIndex = pathArray.lastIndexOf('img');
    super(uri, pathArray.slice(imgIndex + 1).join('/'));
  }


  public matches(path: string): boolean {
    return this.modPath == path;
  }
}
