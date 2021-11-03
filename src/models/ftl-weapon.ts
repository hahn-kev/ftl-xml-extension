import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {Position, TextDocument} from 'vscode';

export class FtlWeapon {
    readonly kind = 'Weapon';
    constructor(name: string, file: FtlFile, node: Node, document: TextDocument) {
        this.file = file;
        this.name = name;
        this.offset = node.start;
        this.position = document.positionAt(node.start);
    }

    public file: FtlFile
    public name: string;
    public offset: number;
    public position: Position
}
