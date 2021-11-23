import {RefMapperBase} from '../ref-mappers/ref-mapper';
import {Node} from 'vscode-html-languageservice';
import {Diagnostic, Location, Position, TextDocument} from 'vscode';
import {FtlFile, FtlFileValue} from '../models/ftl-file';
import {FtlBlueprintList, FtlBlueprintValue} from '../models/ftl-blueprint-list';
import {FtlValue} from '../models/ftl-value';
import {addToKey, firstWhere} from '../helpers';
import {BlueprintListTypeAny} from '../data/ftl-data';
import {BlueprintParser} from './blueprint-parser';
import {DiagnosticBuilder} from '../diagnostic-builder';


export class BlueprintMapper implements RefMapperBase {
    parser: BlueprintParser;
    readonly fileDataSelector: (file: FtlFile) => FtlFileValue<FtlBlueprintList, FtlValue>;

    constructor(private blueprintMappers: RefMapperBase[]) {
        this.parser = new BlueprintParser(blueprintMappers);
        this.fileDataSelector = this.parser.fileDataSelector;
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

    validateRefNames(file: FtlFile, diagnostics: Diagnostic[]): void {
        for (let blueprintMapper of this.blueprintMappers) {
            if (!blueprintMapper.fileDataSelector) continue;
            blueprintMapper.fileDataSelector(file).refs.forEach((refs, refName) => {
                if (this.isNameValid(refName)) return;
                for (let ref of refs) {
                    diagnostics.push(DiagnosticBuilder.invalidRefName({name: refName, typeName: blueprintMapper.typeName, range: ref.range}));
                }
            });
        }

        file.blueprintList.refs.forEach((refs, refName) => {
            if (this.isNameValid(refName)) return;
            for (let ref of refs) {
                diagnostics.push(DiagnosticBuilder.invalidRefName({
                    name: refName,
                    typeName: this.typeName,
                    range: ref.range
                }));
            }
        });
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
            for (let {ref: listRef} of this.listRefs(file)) {
                if (this.defs.has(listRef.name)) {
                    addToKey(this.refs, listRef.name, listRef);
                }
            }
        }
    }

    * listRefs(file: FtlFile): IterableIterator<{ ref: FtlValue, mapper: RefMapperBase }> {
        for (let mapper of this.blueprintMappers) {
            if (!mapper.fileDataSelector) {
                continue;
            }
            for (let refs of mapper.fileDataSelector(file).refs.values()) {
                for (let ref of refs) {
                    yield {ref, mapper};
                }
            }
        }
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

    getListTypeInfoFromBlueprint(blueprintList: FtlBlueprintList): { map: Map<string, FtlBlueprintValue[]>, listTypeName: string } {
        if (blueprintList.isAnyType) return {map: new Map(), listTypeName: BlueprintListTypeAny};
        if (this.findRefLoop(blueprintList.name, blueprintList.childRefNames))
            return {map: new Map(), listTypeName: this.typeName};

        let typeMapper = new Map<string, FtlBlueprintValue[]>();
        for (let child of blueprintList.children) {
            let type = this.getRefType(child.name);
            addToKey(typeMapper, type, child);
        }
        return this.getTypeInfo(typeMapper);
    }

    getListTypeFromBlueprint(blueprintList: FtlBlueprintList) {
        return this.getListTypeInfoFromBlueprint(blueprintList)?.listTypeName;
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