import {FtlFile} from './ftl-file';
import {Position} from 'vscode-languageserver-textdocument';
import {Node} from 'vscode-html-languageservice';
import {TextDocument} from 'vscode';

export class FtlShip {
    readonly kind = 'ship';
    constructor(name: string, file: FtlFile, node: Node, document: TextDocument) {
        this.file = file;
        this.name = name;
        this.offset = node.start;
        this.position = document.positionAt(node.start);
    }

    file: FtlFile
    name: string;
    offset: number;
    position: Position
}
