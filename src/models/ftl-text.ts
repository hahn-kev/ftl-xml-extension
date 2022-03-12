import {FtlValue} from './ftl-value';
import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {FtlTextDocument} from './ftl-text-document';
import {getNodeTextContent} from '../helpers';

export class FtlText extends FtlValue {
  readonly kind = 'Text';
  text?: string;

  constructor(name: string, file: FtlFile, node: Node, document: FtlTextDocument, isDef: boolean) {
    super(name, file, node, document, isDef);
    if (isDef) {
      this.text = getNodeTextContent(node, document);
    }
  }
}
