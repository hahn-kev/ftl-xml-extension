import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {getAttrValueAsInt, getNodeContent, nodeTagEq, toRange} from '../helpers';
import {FtlAnimation} from './ftl-animation';
import {FtlTextDocument} from './ftl-text-document';
import {Range} from 'vscode-languageserver-textdocument';
import {ValueName} from '../ref-mappers/value-name';

export class FtlWeaponAnimation extends FtlAnimation {
  constructor(valueName: ValueName, file: FtlFile, node: Node, document: FtlTextDocument, isDef: boolean) {
    super(valueName, file, node, document, isDef);
    this.chargeImageRange = {end: {character: NaN, line: NaN}, start: {character: NaN, line: NaN}};
    if (isDef) {
      for (const child of node.children) {
        if (nodeTagEq(child, 'chargeImage')) {
          this.chargeImagePath = getNodeContent(child, document)?.name;
          this.chargeImageRange = toRange(child.start, child.end, document);
        }
        if (nodeTagEq(child, 'firePoint')) this.firePoint = this.getPoint(child);
        if (nodeTagEq(child, 'mountPoint')) this.mountPoint = this.getPoint(child);
        if (nodeTagEq(child, 'chargedFrame')) this.chargedFrame = parseFloat(getNodeContent(child, document)?.name ?? '0');
        if (nodeTagEq(child, 'fireFrame')) this.fireFrame = parseFloat(getNodeContent(child, document)?.name ?? '0');
      }
    }
  }

  getPoint(node: Node) {
    const x = getAttrValueAsInt(node, 'x');
    if (x === undefined) return undefined;
    const y = getAttrValueAsInt(node, 'y');
    if (y === undefined) return undefined;
    return {x, y};
  }

  readonly kind = 'weapon animation';
  chargeImagePath?: string;
  chargeImageRange: Range;
  chargedFrame?: number;
  fireFrame?: number;
  firePoint?: {x: number, y: number};
  mountPoint?: {x: number, y: number};
}
