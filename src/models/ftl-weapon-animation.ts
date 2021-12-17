import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {Range, TextDocument} from 'vscode';
import {getNodeTextContent, toRange} from '../helpers';
import {FtlAnimation} from './ftl-animation';

export class FtlWeaponAnimation extends FtlAnimation {
  constructor(name: string, file: FtlFile, node: Node, document: TextDocument, isDef: boolean) {
    super(name, file, node, document, isDef);
    this.chargeImageRange = new Range(NaN, NaN, NaN, NaN);
    if (isDef) {
      const chargeNode = node.children.find((c) => c.tag === 'chargeImage');
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
