import {FtlValue} from './ftl-value';
import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {FtlTextDocument} from './ftl-text-document';
import {getAttrValueForTag} from '../helpers';

export class FtlShipBlueprint extends FtlValue {
  readonly kind = 'Ship Blueprint';

  constructor(name: string, file: FtlFile, node: Node, document: FtlTextDocument, isDef: boolean) {
    super(name, file, node, document, isDef);
    if (isDef) {
      this.layout = getAttrValueForTag(node, 'shipBlueprint', 'layout');
    }
  }

  layout?: string;
}
