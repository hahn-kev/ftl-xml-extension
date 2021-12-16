import {Node} from 'vscode-html-languageservice';
import {Location, Position, TextDocument} from 'vscode';

export interface LookupContext {
  node: Node;
  document: TextDocument;
  position: Position;
}

export interface LookupProvider {
  lookupRefs(context: LookupContext): Location[] | undefined;

  lookupDef(context: LookupContext): Location | undefined;
}
