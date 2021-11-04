import {RefMapperBase} from './ref-mapper';
import {Node} from 'vscode-html-languageservice';
import {
    Diagnostic,
    DiagnosticSeverity,
    Location,
    Position,
    Range,
    TextDocument
} from 'vscode';
import {FtlFile} from '../models/ftl-file';
import {
    FtlBlueprintList,
    FtlBlueprintValue
} from '../models/ftl-blueprint-list';
import {FtlValue} from '../models/ftl-value';
import {
    addToKey,
    firstWhere,
    getAttrValueForTag,
    getNodeTextContent,
    toRange
} from '../helpers';

export class BlueprintMapper implements RefMapperBase {
    constructor(public blueprintMappers: RefMapperBase[]) {

    }

    doMapper<T>(includeSelf: boolean, exec: (mapper: RefMapperBase) => T | undefined) {
        let list = includeSelf ? [this, ...this.blueprintMappers] : this.blueprintMappers;
        return firstWhere(list, exec);
    }

    readonly typeName = 'Blueprint';
    refs = new Map<string, FtlValue[]>();
    defs = new Map<string, FtlBlueprintList>();

    lookupDef(node: Node, document: TextDocument, position: Position): Location | undefined {
        const refName = this.getRefName(node, document, position);
        if (!refName) return;
        return this.doMapper(true, mapper => mapper.defs.get(refName))?.toLocation();
    }


    lookupRefs(node: Node, document: TextDocument, position: Position): Location[] | undefined {
        let refName = this.getRefName(node, document, position);
        if (!refName) return;
        let results = [...this.refs.get(refName) ?? []];
        for (let mapper of this.blueprintMappers) {
            let mapperResults = mapper.refs.get(refName);
            if (mapperResults) results.push(...mapperResults);
        }

        return results.map(value => value.toLocation());
    }

    getRefName(node: Node, document: TextDocument, position: Position): string | undefined {
        let refName = this.getNameNodeText(node, document);
        if (refName) return refName;
        for (let blueprintMapper of this.blueprintMappers) {
            let refName = blueprintMapper.getRefName(node, document, position);
            if (refName) return refName;
        }
    }

    parseNode(node: Node, file: FtlFile, document: TextDocument): void {
        const name = getAttrValueForTag(node, 'blueprintList', 'name');
        if (name) {
            file.blueprintLists.push(new FtlBlueprintList(name, file, node, document));
            return;
        }

        this.parseListChild(node, file, document);
        for (const mapper of this.blueprintMappers) {
            mapper.parseNode(node, file, document);
        }
    }

    parseListChild(node: Node, file: FtlFile, document: TextDocument) {
        const refName = this.getNameNodeText(node, document);
        if (!refName) return;
        addToKey(file.blueprintListRefs, refName, new FtlBlueprintValue(refName, file, node, document));
    }

    tryGetInvalidRefName(node: Node, document: TextDocument): { name: string, range: Range, typeName: string } | undefined {
        const refName = this.getNameNodeText(node, document);
        if (!refName) {
            for (let blueprintMapper of this.blueprintMappers) {
                let refName = blueprintMapper.nodeMap?.getRefName(node, document);
                if (!refName) continue;

                if (this.isNameValid(refName)) return;
                return blueprintMapper.tryGetInvalidRefName(node, document);
            }
            return;
        }
        const invalidForAll = !this.blueprintMappers.some(value => value.isNameValid(refName));
        if (!this.isNameValid(refName) && invalidForAll)
            return {
                name: refName,
                typeName: this.typeName,
                range: toRange(node.start, node.end, document)
            };
    }

    getNameNodeText(node: Node, document: TextDocument) {
        if (node.tag != 'name' || node.parent?.tag != 'blueprintList') return;
        return getNodeTextContent(node, document);
    }

    isNameValid(name: string): boolean {
        return this.defs.has(name);
    }

    updateData(files: FtlFile[]): void {
        this.refs.clear();
        this.defs.clear();
        for (let file of files) {
            for (let blueprintList of file.blueprintLists) {
                this.defs.set(blueprintList.name, blueprintList);
            }
            file.blueprintListRefs.forEach((value, key) => addToKey(this.refs, key, value));
        }

        for (let blueprintMapper of this.blueprintMappers) {
            blueprintMapper.updateData(files);

            //autocomplete values should include blueprint lists
            //todo only include blueprint kinds that match the type
            let blueprintListNames = Array.from(this.defs.keys());
            blueprintMapper.autoCompleteValues?.values.push(...blueprintListNames.map(name => ({name})));
        }

        //we need to do this after the first iteration of files because we need the defs to be setup already
        for (let file of files) {
            this.addRefs(file.weaponRefs.values());
            this.addRefs(file.autoBlueprintRefs.values());
        }
    }

    private addRefs(valuesList: IterableIterator<FtlValue[]>) {
        for (let values of valuesList) {
            for (let value of values) {
                if (this.defs.has(value.name)) {
                    addToKey(this.refs, value.name, value);
                }
            }
        }
    }

    validateListType(node: Node, document: TextDocument): Diagnostic[] {
        if (node.tag != 'blueprintList')
            return [];

        let typeMapper = new Map<string, Node[]>();
        for (let child of node.children) {
            let refName = this.getNameNodeText(child, document);
            if (!refName) continue;
            let type = this.getRefType(refName);
            addToKey(typeMapper, type, child);
        }
        let keys = Array.from(typeMapper.keys());
        if (keys.length < 2) return [];
        let max = 0;
        let type: string;
        typeMapper.forEach((value, key) => {
            if (max > value.length) return;
            max = value.length;
            type = key;
        });
        let results:Diagnostic[] = [];
        typeMapper.forEach((nodes, key) => {
            if (key == type) return;
            results.push(...nodes.map(childNode => {
                return new Diagnostic(toRange(childNode.start, childNode.end, document),
                    `Blueprint '${this.getNameNodeText(childNode, document)}' is type: '${key}' does not match type of list: '${type}'`,
                    DiagnosticSeverity.Warning);
            }));
        });
        return results;
    }

    getRefType(name: string): string {
        let ftlValue = this.doMapper(true, mapper => mapper.defs.get(name));
        return ftlValue?.kind ?? 'unknown';
    }
}
