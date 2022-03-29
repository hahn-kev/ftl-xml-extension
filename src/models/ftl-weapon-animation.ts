import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {getNodeContent, nodeTagEq, toRange} from '../helpers';
import {FtlAnimation} from './ftl-animation';
import {FtlTextDocument} from './ftl-text-document';
import {Range} from 'vscode-languageserver-textdocument';
import {ValueName} from '../ref-mappers/value-name';

export class FtlWeaponAnimation extends FtlAnimation {
  constructor(valueName: ValueName, file: FtlFile, node: Node, document: FtlTextDocument, isDef: boolean) {
    super(valueName, file, node, document, isDef);
    this.chargeImageRange = {end: {character: NaN, line: NaN}, start: {character: NaN, line: NaN}};
    if (isDef) {
      const chargeNode = node.children.find((c) => nodeTagEq(c, 'chargeImage'));
      if (chargeNode) {
        this.chargeImagePath = getNodeContent(chargeNode, document)?.name;
        this.chargeImageRange = toRange(chargeNode.start, chargeNode.end, document);
      }
    }
  }

  readonly kind = 'weapon animation';
  chargeImagePath?: string;
  chargeImageRange: Range;
}
