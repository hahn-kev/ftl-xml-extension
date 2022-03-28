import {Node} from 'vscode-html-languageservice';
import {FtlTextDocument} from '../../models/ftl-text-document';
import {Position} from 'vscode-languageserver-textdocument';

export interface NodeMapContext {
  node: Node;
  document: FtlTextDocument;
  /**
   * it's expected that if position is defined that only one ref is returned
   */
  position?: Position;
}
