import {FtlValue} from './ftl-value';
import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {getAttrValueAsInt, getNodeContent, nodeTagEq, toRange} from '../helpers';
import {FtlTextDocument} from './ftl-text-document';
import {Range} from 'vscode-languageserver-textdocument';
import {ValueName} from '../ref-mappers/value-name';

export class FtlAnimation extends FtlValue {
  constructor(valueName: ValueName, file: FtlFile, node: Node, document: FtlTextDocument, isDef: boolean) {
    super(valueName, file, node, document, isDef);
    if (isDef) {
      for (const child of node.children) {
        if (!this.sheetName) this.sheetName = getNodeContent(child, document, 'sheet')?.name;
        if (nodeTagEq(child, 'time')) this.time = parseFloat(getNodeContent(child, document)?.name ?? '0');
        if (nodeTagEq(child, 'desc')) {
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
