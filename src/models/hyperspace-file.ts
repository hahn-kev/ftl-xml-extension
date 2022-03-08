import {FtlFile} from './ftl-file';
import {TextDocument} from 'vscode';
import {FtlRoot} from './ftl-root';

export class HyperspaceFile extends FtlFile {
  customEventFiles = new Set<string>();

  constructor(document: TextDocument, root: FtlRoot) {
    super(document, root);
    this.isReferenced = true;
  }
}
