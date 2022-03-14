import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {getNodeTextContent, nodeTagEq, toRange} from '../helpers';
import {FtlAnimation} from './ftl-animation';
import {FtlTextDocument} from './ftl-text-document';
import {Range} from 'vscode-languageserver-textdocument';

export class FtlWeaponAnimation extends FtlAnimation {
  constructor(name: string, file: FtlFile, node: Node, document: FtlTextDocument, isDef: boolean) {
    super(name, file, node, document, isDef);
    this.chargeImageRange = {end: {character: NaN, line: NaN}, start: {character: NaN, line: NaN}};
    if (isDef) {
      const chargeNode = node.children.find((c) => nodeTagEq(c, 'chargeImage'));
      if (chargeNode) {
        this.chargeImagePath = getNodeTextContent(chargeNode, document);
        this.chargeImageRange = toRange(chargeNode.start, chargeNode.end, document);
      }
    }
  }

  readonly kind = 'weapon animation';
  chargeImagePath?: string;
  chargeImageRange: Range;
}
