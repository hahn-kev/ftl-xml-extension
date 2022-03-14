import {Node} from 'vscode-html-languageservice';
import {FtlFile} from '../models/ftl-file';
import {FtlTextDocument} from '../models/ftl-text-document';

export interface ParseContext {
  node: Node;
  isModNode: boolean;
  document: FtlTextDocument;
  file: FtlFile;
}
export interface FtlXmlParser {
  parseNode(context: ParseContext): void | FtlXmlParser;
}
