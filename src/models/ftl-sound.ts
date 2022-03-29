import {FtlValue} from './ftl-value';
import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {FtlTextDocument} from './ftl-text-document';
import {getNodeContent} from '../helpers';
import {ValueName} from '../ref-mappers/value-name';

export class FtlSound extends FtlValue {
  kind = 'sound';
  soundFilePath?: string;

  constructor(valueName: ValueName, file: FtlFile, node: Node, document: FtlTextDocument, isDef: boolean) {
    super(valueName, file, node, document, isDef);
    if (isDef) {
      this.soundFilePath = getNodeContent(node, document)?.name;
    }
  }
}
