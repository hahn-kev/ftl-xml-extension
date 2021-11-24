import {FtlValue} from './ftl-value';
import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {TextDocument} from 'vscode';
import {getNodeTextContent} from '../helpers';

export class FtlText extends FtlValue {
  readonly kind = 'Text';
  text?: string;

  constructor(name: string, file: FtlFile, node: Node, document: TextDocument, isDef: boolean) {
    super(name, file, node, document);
    if (isDef) {
      this.text = getNodeTextContent(node, document);
    }
  }
}
