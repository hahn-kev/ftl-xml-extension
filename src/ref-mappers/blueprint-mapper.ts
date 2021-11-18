import {InvalidRef, RefMapperBase} from './ref-mapper';
import {Node} from 'vscode-html-languageservice';
import {Diagnostic, Location, Position, TextDocument} from 'vscode';
import {FtlFile} from '../models/ftl-file';
import {FtlBlueprintList, FtlBlueprintValue} from '../models/ftl-blueprint-list';
import {FtlValue} from '../models/ftl-value';
import {
    addToKey,
    firstWhere,
    getAttrValueForTag,
    getNodeTextContent,
    normalizeAttributeName,
    toRange
} from '../helpers';
import {BlueprintListTypeAny} from '../data/ftl-data';
import {DiagnosticBuilder} from '../diagnostic-builder';
import {FtlXmlParser} from './ref-parser';

class BlueprintParser implements FtlXmlParser {
    constructor(private blueprintMappers: RefMapperBase[]) {
    }

    parseNode(node: Node, file: FtlFile, document: TextDocument): void {
        const name = this.getBlueprintListName(node, document);
        if (name) {
            let ftlBlueprintList = new FtlBlueprintList(name, file, node, document);
            ftlBlueprintList.childRefNames = node.children.filter(c => c.tag == 'name')
                .map(c => this.getNameNodeText(c, document))
                .filter((t): t is string => !!t);

            file.blueprintList.defs.push(ftlBlueprintList);
            addToKey(file.blueprintList.refs, name, ftlBlueprintList);
            return;
        }

        this.parseListChild(node, file, document);
        for (const mapper of this.blueprintMappers) {
            mapper.parser.parseNode(node, file, document);
        }
    }

    parseListChild(node: Node, file: FtlFile, document: TextDocument) {
        const refName = this.getNameNodeText(node, document);
        if (!refName) return;
        addToKey(file.blueprintList.refs, refName, new FtlBlueprintValue(refName, file, node, document));
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

    getBlueprintListName(node: Node, document: TextDocument, position?: Position) {
        return getAttrValueForTag(node, 'blueprintList', 'name', document, position);
    }

    getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
        let name = this.getBlueprintListName(node, document, position);
        if (name) return name;
        for (let mapper of this.blueprintMappers) {
            name = mapper.parser.getNameDef(node, document, position);
            if (name) return name;
        }
    }

    getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
        let result = this.getRefNameAndMapper(node, document, position);
        return result?.name;
    }

    /**
     * returns undefined for mapper if it's mapped by the blueprint mapper
    */
    getRefNameAndMapper(node: Node,
                        document: TextDocument,
                        position?: Position): { name: string, mapper?: RefMapperBase } | undefined {
        let refName = this.getNameNodeText(node, document);
        if (refName) return {name: refName};
        for (let blueprintMapper of this.blueprintMappers) {
            let refName = blueprintMapper.parser.getRefName(node, document, position);
            if (refName) return {name: refName, mapper: blueprintMapper};
        }
    }
}

export class BlueprintMapper implements RefMapperBase {
    parser: BlueprintParser;

    constructor(private blueprintMappers: RefMapperBase[]) {
        this.parser = new BlueprintParser(blueprintMappers);
    }

    doMapper<T>(includeSelf: boolean, exec: (mapper: RefMapperBase) => T | undefined) {
        let list = includeSelf ? [this, ...this.blueprintMappers] : this.blueprintMappers;
        return firstWhere(list, exec);
    }

    readonly typeName = 'Blueprint';
    refs = new Map<string, FtlValue[]>();
    defs = new Map<string, FtlBlueprintList>();

    //todo not consistent with normal lookup, will not return a result
    //when lookup is done on the def itself
    lookupDef(node: Node, document: TextDocument, position: Position): Location | undefined {
        const ref = this.parser.getRefNameAndMapper(node, document, position);
        if (!ref) return;
        let refName = ref.name;
        //this means name was defined in a blueprint list, so find the def somewhere else
        if (!ref.mapper) {
            return this.doMapper(true, mapper => mapper.defs.get(refName))?.toLocation();
        }

        return ref.mapper.defs.get(refName)?.toLocation() ??
            this.defs.get(refName)?.toLocation();
    }


    lookupRefs(node: Node, document: TextDocument, position: Position): Location[] | undefined {
        let refName = this.parser.getNameDef(node, document, position)
            ?? this.parser.getRefName(node, document, position);
        if (!refName) return;
        let results = [...this.refs.get(refName) ?? []];
        for (let mapper of this.blueprintMappers) {
            let mapperResults = mapper.refs.get(refName);
            if (mapperResults) results.push(...mapperResults);
        }

        return results.map(value => value.toLocation());
    }

    tryGetInvalidRefName(node: Node, document: TextDocument): InvalidRef | undefined {
        const refName = this.parser.getNameNodeText(node, document);
        if (!refName) {
            for (let blueprintMapper of this.blueprintMappers) {
                let refName = blueprintMapper.parser.getRefName(node, document);
                if (!refName) continue;

                if (this.defs.has(refName)) return;
                return blueprintMapper.tryGetInvalidRefName(node, document);
            }
            return;
        }

        if (!this.isNameValid(refName))
            return {
                name: refName,
                typeName: this.typeName,
                range: toRange(node.start, node.end, document)
            };
    }

    isNameValid(name: string): boolean {
        return this.defs.has(name) || this.blueprintMappers.some(value => value.isNameValid(name));
    }

    updateData(files: FtlFile[]): void {
        this.refs.clear();
        this.defs.clear();
        for (let file of files) {
            for (let blueprintList of file.blueprintList.defs) {
                this.defs.set(blueprintList.name, blueprintList);
            }
            file.blueprintList.refs.forEach((value, key) => addToKey(this.refs, key, value));
        }

        for (let blueprintMapper of this.blueprintMappers) {
            blueprintMapper.updateData(files);

            //autocomplete values should include blueprint lists
            let blueprintLists = Array.from(this.defs.values());
            let blueprintListNames = blueprintLists
                .filter(blueprintList => !blueprintList.isAnyType && this.getListTypeFromBlueprint(blueprintList) == blueprintMapper.typeName)
                .map(blueprintList => blueprintList.name);
            blueprintMapper.autoCompleteValues?.values.push(...blueprintListNames.map(name => ({name})));
        }

        //we need to do this after the first iteration of files because we need the defs to be setup already
        for (let file of files) {
            for (let mapper of this.blueprintMappers) {
                if (mapper.fileDataSelector)
                    this.addRefs(mapper.fileDataSelector(file).refs.values());
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

    validateRefType(node: Node, document: TextDocument): Diagnostic | undefined {
        //skip name's in list because they're done in validateListType
        if (node.tag == 'name') return;

        let ref = this.parser.getRefNameAndMapper(node, document);
        if (!ref) return;
        let refName = ref.name;
        let refMapper = ref.mapper ?? this;

        //fixes case for RANDOM which is valid for multiple names
        if (refMapper.isNameValid(refName)) return;

        let defType = this.getRefType(refName);
        if (refMapper.typeName === defType) return;
        return DiagnosticBuilder.blueprintRefTypeInvalid(node, document, defType, refName, refMapper.typeName);

    }

    validateListRefLoop(node: Node, document: TextDocument): Diagnostic | undefined {
        let listName = getAttrValueForTag(node, 'blueprintList', 'name');
        if (!listName) return;
        let blueprintList = this.defs.get(listName);
        if (!blueprintList) return;
        let namesInLoop = this.findRefLoop(listName, blueprintList.childRefNames);
        if (!namesInLoop) return;
        return DiagnosticBuilder.listHasRefLoop(node, document, listName);
    }

    findRefLoop(listName: string, children: string[]): string[] | undefined {
        for (let childName of children) {
            if (childName == listName) return [];
            let blueprintList = this.defs.get(childName);
            if (!blueprintList) continue;
            let result = this.findRefLoop(listName, blueprintList.childRefNames);
            if (result) {
                result.unshift(childName);
                return result;
            }
        }
    }

    static ignoreListNames = ['DLC_ITEMS', 'DEMO_LOCKED_ITEMS'];

    validateListType(node: Node, document: TextDocument): Diagnostic[] {
        let listName = getAttrValueForTag(node, 'blueprintList', 'name');
        if (!listName || BlueprintMapper.ignoreListNames.includes(listName)) return [];

        let typeResults = this.getListTypeInfoFromNode(node, document);
        if (!typeResults) return [];
        let {map: typeMapper, listTypeName} = typeResults;
        if (listTypeName == BlueprintListTypeAny) return [];

        let results: Diagnostic[] = [];
        typeMapper.forEach((nodes, type) => {
            if (type == listTypeName) return;
            results.push(...nodes.map(childNode =>
                DiagnosticBuilder.listTypeMisMatch(this.parser.getNameNodeText(childNode, document),
                    type,
                    listTypeName,
                    childNode,
                    document)));
        });
        return results;
    }

    getListTypeInfoFromNode(node: Node,
                            document: TextDocument): { map: Map<string, Node[]>, listTypeName: string } | undefined {
        if (node.tag != 'blueprintList') return;
        if (normalizeAttributeName(node.attributes?.type) === BlueprintListTypeAny)
            return {map: new Map(), listTypeName: BlueprintListTypeAny};

        let typeMapper = new Map<string, Node[]>();
        for (let child of node.children) {
            let refName = this.parser.getNameNodeText(child, document);
            if (!refName) continue;
            let type = this.getRefType(refName);
            addToKey(typeMapper, type, child);
        }
        return this.getTypeInfo(typeMapper);
    }

    getListTypeFromBlueprint(blueprintList: FtlBlueprintList) {
        if (blueprintList.isAnyType) return BlueprintListTypeAny;
        if (this.findRefLoop(blueprintList.name, blueprintList.childRefNames))
            return this.typeName;

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
