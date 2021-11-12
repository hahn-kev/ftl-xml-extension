import {RefMapperBase} from './ref-mapper';
import {Node} from 'vscode-html-languageservice';
import {Diagnostic, DiagnosticSeverity, Location, Position, Range, TextDocument} from 'vscode';
import {FtlFile} from '../models/ftl-file';
import {FtlBlueprintList, FtlBlueprintValue} from '../models/ftl-blueprint-list';
import {FtlValue} from '../models/ftl-value';
import {addToKey, firstWhere, getAttrValueForTag, getNodeTextContent, toRange} from '../helpers';

export class BlueprintMapper implements RefMapperBase {

    constructor(private blueprintMappers: RefMapperBase[]) {
    }

    doMapper<T>(includeSelf: boolean, exec: (mapper: RefMapperBase) => T | undefined) {
        let list = includeSelf ? [this, ...this.blueprintMappers] : this.blueprintMappers;
        return firstWhere(list, exec);
    }

    readonly typeName = 'Blueprint';
    refs = new Map<string, FtlValue[]>();
    defs = new Map<string, FtlBlueprintList>();

    lookupDef(node: Node, document: TextDocument, position: Position): Location | undefined {
        const ref = this.getRefNameAndMapper(node, document, position);
        if (!ref) return;
        let refName = ref.name;
        if (ref.mapper.typeName == this.typeName) {
            return this.doMapper(true, mapper => mapper.defs.get(refName))?.toLocation();
        }

        return ref.mapper.defs.get(refName)?.toLocation() ??
            this.defs.get(refName)?.toLocation();
    }


    lookupRefs(node: Node, document: TextDocument, position: Position): Location[] | undefined {
        let refName = getAttrValueForTag(node, 'blueprintList', 'name', document, position)
            ?? this.getRefName(node, document, position);
        if (!refName) return;
        let results = [...this.refs.get(refName) ?? []];
        for (let mapper of this.blueprintMappers) {
            let mapperResults = mapper.refs.get(refName);
            if (mapperResults) results.push(...mapperResults);
        }

        return results.map(value => value.toLocation());
    }

    getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
        let result = this.getRefNameAndMapper(node, document, position);
        return result?.name;
    }

    getRefNameAndMapper(node: Node, document: TextDocument, position?: Position): { name: string, mapper: RefMapperBase } | undefined {
        let refName = this.getNameNodeText(node, document);
        if (refName) return {name: refName, mapper: this};
        for (let blueprintMapper of this.blueprintMappers) {
            let refName = blueprintMapper.getRefName(node, document, position);
            if (refName) return {name: refName, mapper: blueprintMapper};
        }
    }

    parseNode(node: Node, file: FtlFile, document: TextDocument): void {
        const name = getAttrValueForTag(node, 'blueprintList', 'name');
        if (name) {
            let ftlBlueprintList = new FtlBlueprintList(name, file, node, document);
            ftlBlueprintList.childRefNames = node.children.filter(c => c.tag == 'name')
                .map(c => this.getNameNodeText(c, document))
                .filter((t): t is string => !!t);

            file.blueprintLists.push(ftlBlueprintList);
            addToKey(file.blueprintListRefs, name, ftlBlueprintList);
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
        if (!this.isListChild(node)) return;
        let name = getNodeTextContent(node, document);
        if (name?.startsWith('HIDDEN '))
            return name?.substring('HIDDEN '.length);
        return name;
    }

    isListChild(node: Node) {
        return node.tag == 'name' && node.parent?.tag == 'blueprintList';
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
            let blueprintLists = Array.from(this.defs.values());
            let blueprintListNames = blueprintLists.filter(blueprintList => this.getListTypeFromBlueprint(blueprintList) == blueprintMapper.typeName)
                .map(blueprintList => blueprintList.name);
            blueprintMapper.autoCompleteValues?.values.push(...blueprintListNames.map(name => ({name})));
        }

        //we need to do this after the first iteration of files because we need the defs to be setup already
        for (let file of files) {
            for (let mapper of this.blueprintMappers) {
                if (mapper.fileRefSelector)
                    this.addRefs(mapper.fileRefSelector(file).values());
            }
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

    validateRefType(node: Node, document: TextDocument): Diagnostic[] {
        if (node.tag == 'name') return [];
        let ref = this.getRefNameAndMapper(node, document);
        if (!ref) return [];
        let refName = ref.name;

        //quick return if defined in the matching mapper
        if (ref.mapper.defs.has(refName) || ref.mapper.defaults?.includes(refName))
            return [];

        let def: FtlValue | undefined;
        let defMapper: RefMapperBase | undefined;
        for (defMapper of [this, ...this.blueprintMappers]) {
            def = defMapper.defs.get(refName);
            if (def) break;
        }
        if (!def || !defMapper) return [];
        let defType: string | undefined = defMapper.typeName;
        //the defined value is a list, determine the list type
        if (defType === this.typeName && def instanceof FtlBlueprintList) {
            defType = this.getListTypeFromBlueprint(def);
        }
        if (ref.mapper.typeName === defType || !defType) return [];
        let message = `${ref.mapper.typeName} can't reference a ${defType}, which is the type of blueprint: '${refName}' `;

        return [new Diagnostic(toRange(node.start, node.startTagEnd ?? node.end, document),
            message,
            DiagnosticSeverity.Warning)]
    }

    validateListRefLoop(node: Node, document: TextDocument): Diagnostic | undefined {
        let listName = getAttrValueForTag(node, 'blueprintList', 'name');
        if (!listName) return;
        let blueprintList = this.defs.get(listName);
        if (!blueprintList) return;
        let children = [...blueprintList.childRefNames];
        let nameSet = new Set<string>();
        nameSet.add(listName);
        for (let i = 0; i < children.length; i++) {
            let childName = children[i];
            let childList = this.defs.get(childName);
            if (!childList) continue;
            if (nameSet.has(childName)) {
                return new Diagnostic(
                    toRange(node.start, node.startTagEnd ?? node.end, document),
                    `Blueprint List: ${listName} is self referencing (possibly through another list)`,
                    DiagnosticSeverity.Error
                );
            }
            nameSet.add(childName);
            children.push(...childList.childRefNames);
        }
    }

    static ignoreListNames = ['DLC_ITEMS'];

    validateListType(node: Node, document: TextDocument): Diagnostic[] {
        let listName = getAttrValueForTag(node, 'blueprintList', 'name');
        if (!listName || BlueprintMapper.ignoreListNames.includes(listName)) return [];

        let typeResults = this.getListTypeInfoFromNode(node, document);
        if (!typeResults) return [];
        let {map: typeMapper, listTypeName} = typeResults;
        let results: Diagnostic[] = [];
        typeMapper.forEach((nodes, key) => {
            if (key == listTypeName) return;
            results.push(...nodes.map(childNode => {
                let name = this.getNameNodeText(childNode, document);
                let message = `Blueprint '${name}' is type: '${key}' does not match type of list: '${listTypeName}'`;
                return new Diagnostic(toRange(childNode.start, childNode.end, document),
                    message,
                    DiagnosticSeverity.Warning);
            }));
        });
        return results;
    }

    getListTypeInfoFromNode(node: Node, document: TextDocument): { map: Map<string, Node[]>, listTypeName: string } | undefined {
        if (node.tag != 'blueprintList') return;
        let typeMapper = new Map<string, Node[]>();
        for (let child of node.children) {
            let refName = this.getNameNodeText(child, document);
            if (!refName) continue;
            let type = this.getRefType(refName);
            addToKey(typeMapper, type, child);
        }
        return this.getTypeInfo(typeMapper);
    }

    getListTypeFromBlueprint(blueprintList: FtlBlueprintList) {
        let typeMapper = new Map<string, string[]>();
        for (let refName of blueprintList.childRefNames) {
            let type = this.getRefType(refName);
            addToKey(typeMapper, type, refName);
        }
        let typeInfo = this.getTypeInfo(typeMapper);
        return typeInfo.listTypeName;
    }

    getTypeInfo<T>(typeMapper: Map<string, T[]>) {
        let keys = Array.from(typeMapper.keys());
        if (keys.length < 2) return {
            map: typeMapper,
            listTypeName: keys[0] ?? 'Unknown'
        };
        let max = 0;
        let type: string;
        typeMapper.forEach((value, key) => {
            if (max > value.length) return;
            max = value.length;
            type = key;
        });
        return {map: typeMapper, listTypeName: type!};
    }

    getRefType(name: string): string {
        let list = this.defs.get(name);
        if (list) {
            return this.getListTypeFromBlueprint(list);
        }
        let mapper = this.doMapper(false, mapper => {
            return (mapper.defs.has(name) || mapper.defaults?.includes(name)) ? mapper : undefined;
        });
        return mapper?.typeName ?? 'Unknown';
    }

    getMapperForTypeName(type: string): RefMapperBase | undefined {
        return this.doMapper(true, mapper => mapper.typeName == type ? mapper : undefined);
    }

    getAllBlueprintNames(): string[] {
        return [this, ...this.blueprintMappers]
            .flatMap((value: RefMapperBase) => value.autoCompleteValues?.values ?? [])
            .map(value => value.name);
    }
}
