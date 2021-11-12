import {FtlValue} from './ftl-value';
import {TextDocument} from 'vscode';
import {Node} from 'vscode-html-languageservice';
import {FtlFile} from './ftl-file';
import {BlueprintListTypeAny} from '../data/ftl-data';

export class FtlBlueprintList extends FtlValue {
    readonly kind = 'blueprint-list';

    constructor(name: string, file: FtlFile, node: Node, document: TextDocument) {
        super(name, file, node, document);
        this.isAnyType = node.attributes?.type == BlueprintListTypeAny;
    }

    public childRefNames: string[] = [];
    public readonly isAnyType: boolean;
}

export class FtlBlueprintValue extends FtlValue {
    readonly kind = 'blueprint-list-value';

    constructor(name: string, file: FtlFile, node: Node, document: TextDocument) {
        super(name, file, node, document);
    }
}
