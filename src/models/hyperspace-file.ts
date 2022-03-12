import {FtlFile} from './ftl-file';
import {FtlTextDocument} from './ftl-text-document';
import {FtlRoot} from './ftl-root';

export class HyperspaceFile extends FtlFile {
  customEventFiles = new Set<string>();

  constructor(document: FtlTextDocument, root: FtlRoot) {
    super(document, root);
    this.isReferenced = true;
  }
}
