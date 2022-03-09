import {FtlValue} from './ftl-value';
import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {TextDocument} from 'vscode';
import {firstWhere, getNodeTextContent} from '../helpers';


export class FtlEvent extends FtlValue {
  readonly kind = 'Event';

  constructor(name: string, file: FtlFile, node: Node, document: TextDocument, isDef: boolean) {
    super(name, file, node, document, isDef);
    if (isDef) {
      const text = firstWhere(node.children, (child) => getNodeTextContent(child, document, 'text'));
      if (text) {
        this.autocompleteDescription = `File: ${file.fileName}  \r\nText: ${text}`;
      }
    }
  }
}
