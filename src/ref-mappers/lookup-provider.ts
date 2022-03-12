import {Location, Node} from 'vscode-html-languageservice';
import {FtlTextDocument} from '../models/ftl-text-document';
import {Position} from 'vscode-languageserver-textdocument';

export interface LookupContext {
  node: Node;
  document: FtlTextDocument;
  position: Position;
}

export interface LookupProvider {
  lookupRefs(context: LookupContext): Location[] | undefined;

  lookupDef(context: LookupContext): Location | undefined;
}
