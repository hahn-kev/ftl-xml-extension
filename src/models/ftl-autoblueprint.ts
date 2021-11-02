import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {Position, TextDocument} from 'vscode';

export class FtlAutoblueprint {
    readonly kind = 'Blueprint';
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
