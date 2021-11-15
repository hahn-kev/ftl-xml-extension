import {Node} from 'vscode-html-languageservice';
import {FtlFile, FtlFileValue} from '../models/ftl-file';
import {Position, TextDocument} from 'vscode';
import {NodeMap} from './ref-mapper';
import {FtlValue} from '../models/ftl-value';

export interface IRefParser {
    parseNode(node: Node, file: FtlFile, document: TextDocument): void;
    getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined;
    getRefName(node: Node, document: TextDocument, position?: Position): string | undefined;
}

export class RefParser<T extends FtlValue = FtlValue> implements IRefParser {
    constructor(public fileDataSelector: (file: FtlFile) => FtlFileValue<T>,
                private readonly newFromNode: {
                    new(name: string,
                        file: FtlFile,
                        node: Node,
                        document: TextDocument): T
                },
                public readonly nodeMap: NodeMap) {
    }

    parseNode(node: Node, file: FtlFile, document: TextDocument): void {
        let nameDef = this.nodeMap.getNameDef(node, document);
        if (nameDef) {
            let fileValue = this.fileDataSelector(file);
            let ftlEvent = new this.newFromNode(nameDef, file, node, document);
            fileValue.defs.push(ftlEvent);
            fileValue.addRef(nameDef, ftlEvent);
        } else {
            let nameRef = this.nodeMap.getRefName(node, document);
            if (nameRef) {
                let fileValue = this.fileDataSelector(file);
                fileValue.addRef(nameRef, new this.newFromNode(nameRef, file, node, document));
            }
        }
    }

    getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
        return this.nodeMap.getNameDef(node, document, position);
    }

    getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
        return this.nodeMap.getRefName(node, document, position);
    }
}
