import {FtlValue} from './ftl-value';
import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {getAttrValueAsInt, getNodeTextContent, toRange} from '../helpers';
import {FtlTextDocument} from './ftl-text-document';
import {Range} from 'vscode-languageserver-textdocument';

export class FtlAnimation extends FtlValue {
  constructor(name: string, file: FtlFile, node: Node, document: FtlTextDocument, isDef: boolean) {
    super(name, file, node, document, isDef);
    if (isDef) {
      for (const child of node.children) {
        if (!this.sheetName) this.sheetName = getNodeTextContent(child, document, 'sheet');
        if (child.tag == 'time') this.time = parseFloat(getNodeTextContent(child, document) ?? '0');
        if (child.tag == 'desc') {
          this.length = getAttrValueAsInt(child, 'length');
          this.x = getAttrValueAsInt(child, 'x');
          this.y = getAttrValueAsInt(child, 'y');
          this.descRange = toRange(child.start, child.end, document);
        }
      }
    }
  }

  sheetName?: string;
  time?: number;
  length?: number;
  x?: number;
  y?: number;
  descRange?: Range;
  kind = 'animation';
}
