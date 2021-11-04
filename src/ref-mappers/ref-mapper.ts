import {FtlFile} from '../models/ftl-file';
import {IValueSet, Node} from 'vscode-html-languageservice';
import {Location, Position, Range, TextDocument} from 'vscode';
import {addToKey, toRange} from '../helpers';
import {FtlValue} from '../models/ftl-value';

export interface RefMapperBase {
    updateData(files: FtlFile[]): void;

    lookupRefs(node: Node, document: TextDocument, position: Position): Location[] | undefined;

    lookupDef(node: Node, document: TextDocument, position: Position): Location | undefined;

    readonly typeName: string;
    readonly nodeMap?: NodeMap;
    readonly autoCompleteValues?: IValueSet;
    readonly refs: Map<string, FtlValue[]>;
    readonly defs: Map<string, FtlValue>;

    tryGetInvalidRefName(node: Node, document: TextDocument): { name: string, range: Range, typeName: string } | undefined;

    parseNode(node: Node, file: FtlFile, document: TextDocument): void;

    isNameValid(name: string): boolean;

    getRefName(node: Node, document: TextDocument, position: Position): string | undefined;
}

export interface NodeMap {
    getNameDef(node: Node, document: TextDocument): string | undefined;

    getRefName(node: Node, document: TextDocument): string | undefined;
}

interface AdditionalDefsProvider {
    isNameValid(name: string): boolean;
}

export class RefMapper<T extends FtlValue> implements RefMapperBase {
    readonly refs = new Map<string, T[]>();
    readonly defs = new Map<string, T>();

    constructor(private fileSelector: (file: FtlFile) => T[],
                private fileRefSelector: (file: FtlFile) => Map<string, T[]>,
                private newFromNode: (name: string, file: FtlFile, node: Node, document: TextDocument) => T,
                public nodeMap: NodeMap,
                public readonly autoCompleteValues: IValueSet,
                public readonly typeName: string,
                private defaults: readonly string[] = []) {
    }

    updateData(files: FtlFile[]) {
        this.refs.clear();
        this.defs.clear();
        this.autoCompleteValues.values.length = 0;

        let customNames = files.flatMap(this.fileSelector).map(value => value.name);
        this.autoCompleteValues.values.push(...customNames.concat(this.defaults).map(name => ({name})));

        for (let file of files) {
            this.fileRefSelector(file).forEach((value, key) => addToKey(this.refs, key, value));
            for (let value of this.fileSelector(file)) {
                this.defs.set(value.name, value);
            }
        }
    }

    lookupRefs(node: Node, document: TextDocument, position: Position): Location[] | undefined {
        let name = this.getRefName(node, document, position);
        if (!name) return;
        let values = this.refs.get(name);
        return values?.map((value: FtlValue) => value.toLocation());
    }

    lookupDef(node: Node, document: TextDocument, position: Position): Location | undefined {
        let name = this.getRefName(node, document, position);
        if (!name) return;
        let value = this.defs.get(name);
        if (value) return value.toLocation();
    }

    getRefName(node: Node, document: TextDocument, position: Position) {
        return this.nodeMap.getNameDef(node, document) ?? this.nodeMap.getRefName(node, document);
    }

    tryGetInvalidRefName(node: Node, document: TextDocument): { name: string, range: Range, typeName: string } | undefined {
        if (this.defs.size == 0) return;

        let refName = this.nodeMap.getRefName(node, document);
        if (refName && !this.isNameValid(refName))
            return {
                name: refName,
                typeName: this.typeName,
                range: toRange(node.start, node.startTagEnd ?? node.end, document)
            };
    }

    isNameValid(name: string) {
        return this.defs.has(name) || this.defaults.includes(name);
    }

    parseNode(node: Node, file: FtlFile, document: TextDocument) {
        let nameDef = this.nodeMap.getNameDef(node, document);
        if (nameDef) {
            let ftlEvent = this.newFromNode(nameDef, file, node, document);
            this.fileSelector(file).push(ftlEvent);
            addToKey(this.fileRefSelector(file), nameDef, ftlEvent);
        } else {
            let nameRef = this.nodeMap.getRefName(node, document);
            if (nameRef) {
                addToKey(this.fileRefSelector(file), nameRef, this.newFromNode(nameRef, file, node, document));
            }
        }
    }
}



