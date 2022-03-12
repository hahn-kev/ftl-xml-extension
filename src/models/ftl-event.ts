import {FtlValue} from './ftl-value';
import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {firstWhere, getNodeTextContent} from '../helpers';
import {FtlTextDocument} from './ftl-text-document';


export class FtlEvent extends FtlValue {
  readonly kind = 'Event';

  constructor(name: string, file: FtlFile, node: Node, document: FtlTextDocument, isDef: boolean) {
    super(name, file, node, document, isDef);
    if (isDef) {
      const text = firstWhere(node.children, (child) => getNodeTextContent(child, document, 'text'));
      if (text) {
        this.autocompleteDescription = `File: ${file.fileName}  \r\nText: ${text}`;
      }
    }
  }

  /**
   * references that risk crashing the game with a recursive loop
   */
  unsafeEventRefs?: Set<string>;
}
