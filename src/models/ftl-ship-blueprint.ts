import {FtlValue} from './ftl-value';
import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {FtlTextDocument} from './ftl-text-document';
import {getAttrValueForTag} from '../helpers';
import {ValueName} from '../ref-mappers/value-name';

export class FtlShipBlueprint extends FtlValue {
  readonly kind = 'Ship Blueprint';

  constructor(valueName: ValueName, file: FtlFile, node: Node, document: FtlTextDocument, isDef: boolean) {
    super(valueName, file, node, document, isDef);
    if (isDef) {
      this.layout = getAttrValueForTag(node, 'shipBlueprint', 'layout', document)?.name;
    }
  }

  layout?: string;
}
