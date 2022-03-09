import {FtlValue} from './ftl-value';
import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {TextDocument} from 'vscode';
import {firstWhere, getNodeTextContent} from '../helpers';

export class FtlWeapon extends FtlValue {
  readonly kind = 'Weapon';

  constructor(name: string, file: FtlFile, node: Node, document: TextDocument, isDef: boolean) {
    super(name, file, node, document, isDef);
    if (isDef) {
      const title = firstWhere(node.children, (child) => getNodeTextContent(child, document, 'title'));
      if (title) this.autocompleteDescription = `Title: ${title}`;
    }
  }
}
