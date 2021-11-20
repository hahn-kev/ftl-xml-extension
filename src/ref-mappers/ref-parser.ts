import {Node} from 'vscode-html-languageservice';
import {FtlFile, FtlFileValue} from '../models/ftl-file';
import {Position, TextDocument} from 'vscode';
import {NodeMap} from './ref-mapper';
import {FtlValue} from '../models/ftl-value';
import {FtlXmlParser} from '../parsers/ftl-xml-parser';

export interface FtlRefParser extends FtlXmlParser {
    getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined;

    getRefName(node: Node, document: TextDocument, position?: Position): string | undefined;
}

type FtlValueConst<T> = { new(name: string, file: FtlFile, node: Node, document: TextDocument): T; }
    | { new(name: string, file: FtlFile, node: Node, document: TextDocument, isDef: boolean): T; };

export class RefParser<T extends FtlValue = FtlValue> implements FtlXmlParser, FtlRefParser {
    constructor(public fileDataSelector: (file: FtlFile) => FtlFileValue<T>,
                private readonly newFromNode: FtlValueConst<T>,
                public readonly nodeMap: NodeMap) {
    }

    parseNode(node: Node, file: FtlFile, document: TextDocument): void {
        let nameDef = this.nodeMap.getNameDef(node, document);
        if (nameDef) {
            let fileValue = this.fileDataSelector(file);
            let ftlEvent = new this.newFromNode(nameDef, file, node, document, true);
            fileValue.defs.push(ftlEvent);
            fileValue.addRef(nameDef, ftlEvent);
        } else {
            let nameRef = this.nodeMap.getRefName(node, document);
            if (nameRef) {
                let fileValue = this.fileDataSelector(file);
                fileValue.addRef(nameRef, new this.newFromNode(nameRef, file, node, document, false));
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
