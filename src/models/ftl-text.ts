import {FtlValue} from './ftl-value';
import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {FtlTextDocument} from './ftl-text-document';
import {getNodeContent} from '../helpers';
import {ValueName} from '../ref-mappers/value-name';

export class FtlText extends FtlValue {
  readonly kind = 'Text';
  text?: string;

  constructor(valueName: ValueName, file: FtlFile, node: Node, document: FtlTextDocument, isDef: boolean) {
    super(valueName, file, node, document, isDef);
    if (isDef) {
      this.text = getNodeContent(node, document)?.name;
    }
  }
}
