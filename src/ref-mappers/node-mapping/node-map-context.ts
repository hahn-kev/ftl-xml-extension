import {Node} from 'vscode-html-languageservice';
import {FtlTextDocument} from '../../models/ftl-text-document';

export interface NodeMapContext {
  node: Node;
  document: FtlTextDocument;
}
