import {Node} from 'vscode-html-languageservice';
import {FtlFile} from '../models/ftl-file';
import {TextDocument} from 'vscode';

export interface ParseContext {
  node: Node;
  document: TextDocument;
  file: FtlFile;
}
export interface FtlXmlParser {
  parseNode(context: ParseContext): void;
}
