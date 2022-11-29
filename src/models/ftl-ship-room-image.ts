import {FtlResourceFile} from './ftl-resource-file';
import {URI} from 'vscode-uri';

export class FtlShipRoomImage extends FtlResourceFile {
  constructor(uri: URI) {
    const pathArray = uri.path.split('/');
    const imgIndex = pathArray.lastIndexOf('interior');
    super(uri, pathArray[imgIndex + 1].slice(0, '.png'.length * -1));
  }
}
