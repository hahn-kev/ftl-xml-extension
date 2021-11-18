import {FtlFile, FtlFileValue} from '../models/ftl-file';
import {IValueSet, Node} from 'vscode-html-languageservice';
import {Location, Position, Range, TextDocument} from 'vscode';
import {addToKey, toRange} from '../helpers';
import {FtlValue} from '../models/ftl-value';
import {FtlRefParser, RefParser} from './ref-parser';

export type InvalidRef = { name: string, range: Range, typeName: string }

export interface RefMapperBase {
    updateData(files: FtlFile[]): void;

    lookupRefs(node: Node, document: TextDocument, position: Position): Location[] | undefined;

    lookupDef(node: Node, document: TextDocument, position: Position): Location | undefined;

    readonly typeName: string;
    readonly defaults?: readonly string[];
    readonly nodeMap?: NodeMap;
    readonly autoCompleteValues?: IValueSet;
    readonly refs: Map<string, FtlValue[]>;
    readonly defs: Map<string, FtlValue>;
    readonly fileDataSelector?: (file: FtlFile) => FtlFileValue<FtlValue>,
    readonly parser: FtlRefParser,

    tryGetInvalidRefName(node: Node, document: TextDocument): InvalidRef | undefined;

    isNameValid(name: string): boolean;
}

export interface NodeMap {
    getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined;

    getRefName(node: Node, document: TextDocument, position?: Position): string | undefined;
}

export class RefMapper<T extends FtlValue> implements RefMapperBase {
    readonly refs = new Map<string, T[]>();
    readonly defs = new Map<string, T>();


    public get nodeMap(): NodeMap {
        return this.parser.nodeMap;
    }

    constructor(public parser: RefParser<T>,
                public readonly autoCompleteValues: IValueSet,
                public readonly typeName: string,
                public defaults: readonly string[] = []) {
    }

    updateData(files: FtlFile[]) {
        this.refs.clear();
        this.defs.clear();
        this.autoCompleteValues.values.length = 0;

        let names = new Set(files.flatMap(file => this.parser.fileDataSelector(file).defs)
            .map(value => value.name)
            .concat(this.defaults));

        this.autoCompleteValues.values
            .push(...Array.from(names.values()).map(name => ({name})));

        for (let file of files) {
            this.parser.fileDataSelector(file).refs.forEach((value, key) => addToKey(this.refs, key, value));
            for (let value of this.parser.fileDataSelector(file).defs) {
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
        return this.parser.nodeMap.getNameDef(node, document, position) ??
            this.parser.nodeMap.getRefName(node, document, position);
    }

    tryGetInvalidRefName(node: Node, document: TextDocument): InvalidRef | undefined {
        if (this.defs.size == 0) return;

        let refName = this.parser.nodeMap.getRefName(node, document);
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
}



