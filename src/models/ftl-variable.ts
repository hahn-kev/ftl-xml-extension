import {FtlValue} from './ftl-value';
import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {FtlTextDocument} from './ftl-text-document';
import {nodeTagEq} from '../helpers';

export class FtlVariable extends FtlValue {
  readonly kind = 'Variable';

  constructor(name: string, file: FtlFile, node: Node, document: FtlTextDocument, isDef: boolean) {
    super(name, file, node, document, isDef);
    this.type = nodeTagEq(node, 'variable') ? 'var' : 'meta';
  }

  type: 'var' | 'meta';
}
