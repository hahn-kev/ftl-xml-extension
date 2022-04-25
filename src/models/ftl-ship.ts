import {FtlValue} from './ftl-value';
import {ValueName} from '../ref-mappers/value-name';
import {FtlFile} from './ftl-file';
import {FtlTextDocument} from './ftl-text-document';
import {Node} from 'vscode-html-languageservice';
import {normalizeAttributeName} from '../helpers';

export class FtlShip extends FtlValue {
  readonly kind = 'Ship';

  constructor(valueName: ValueName, file: FtlFile, node: Node, document: FtlTextDocument, isDef: boolean) {
    super(valueName, file, node, document, isDef);
    if (isDef) {
      this.unusedOk = normalizeAttributeName(node.attributes?.unused)?.toLowerCase() == 'true';
    }
  }

  unusedOk?: boolean;
}
