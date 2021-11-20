import {Node} from 'vscode-html-languageservice';
import {FtlFile} from '../models/ftl-file';
import {TextDocument} from 'vscode';

export interface FtlXmlParser {
    parseNode(node: Node, file: FtlFile, document: TextDocument): void;
}
