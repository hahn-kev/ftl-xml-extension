import {FtlValue} from './ftl-value';
import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {TextDocument} from 'vscode';
import {getAttrValueForTag} from '../helpers';

export class FtlAutoblueprint extends FtlValue {
  readonly kind = 'Auto Blueprint';

  constructor(name: string, file: FtlFile, node: Node, document: TextDocument, isDef: boolean) {
    super(name, file, node, document, isDef);
    if (isDef) {
      this.layout = getAttrValueForTag(node, 'shipBlueprint', 'layout');
    }
  }

  layout?: string;
}
