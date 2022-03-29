import {FtlValue} from './ftl-value';
import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {FtlTextDocument} from './ftl-text-document';
import {nodeTagEq} from '../helpers';
import {ValueName} from '../ref-mappers/value-name';

export class FtlVariable extends FtlValue {
  readonly kind = 'Variable';

  constructor(valueName: ValueName, file: FtlFile, node: Node, document: FtlTextDocument, isDef: boolean) {
    super(valueName, file, node, document, isDef);
    this.type = nodeTagEq(node, 'variable') ? 'var' : 'meta';
  }

  type: 'var' | 'meta';
}
