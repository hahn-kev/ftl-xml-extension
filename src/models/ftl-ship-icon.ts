import {FtlResourceFile} from './ftl-resource-file';
import {URI} from 'vscode-uri';

export class FtlShipIcon extends FtlResourceFile {
  constructor(uri: URI) {
    const pathArray = uri.path.split('/');
    const imgIndex = pathArray.lastIndexOf('icons');
    super(uri, pathArray[imgIndex + 1].slice(0, '.png'.length * -1));
  }
}
