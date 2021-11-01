import {FtlFile} from '../models/ftl-file';
import {FtlShip} from '../models/ftl-ship';
import {IValueData, IValueSet, Node} from 'vscode-html-languageservice';
import {EventNamesValueSet, ShipNames} from '../data/ftl-data';
import {defaultEvents} from '../data/default-events';
import {defaultShips} from '../data/default-ships';
import {Location, Position, TextDocument} from 'vscode';
import {FtlEvent} from '../models/ftl-event';
import {events} from '../events';
import {ships} from '../ships';
import {addToKey, toLocation} from '../helpers';

export interface RefMapperBase {
    updateData(files: FtlFile[]): void;

    lookupRefs(node: Node, document: TextDocument): Location[] | undefined;

    lookupDef(node: Node, document: TextDocument): Location | undefined;

    readonly typeName: string;

    tryGetInvalidRefName(node: Node, document: TextDocument): string | undefined;

    parseNode(node: Node, file: FtlFile, document: TextDocument): void;
}

interface NodeMap {
    getNameDef(node: Node, document: TextDocument): string | undefined;

    getRefName(node: Node, document: TextDocument): string | undefined;
}

export class RefMapper<T extends { file: FtlFile, position: Position }> implements RefMapperBase {
    refs = new Map<string, T[]>();
    defs = new Map<string, T>();

    constructor(private fileSelector: (file: FtlFile) => T[],
                private fileRefSelector: (file: FtlFile) => Map<string, T[]>,
                private nameSelector: (value: T) => string,
                private newFromNode: (name: string, file: FtlFile, node: Node, document: TextDocument) => T,
                private nodeMap: NodeMap,
                public valueSet: IValueSet,
                public typeName: string,
                private defaults: readonly string[] = []) {
    }

    updateData(files: FtlFile[]) {
        this.refs.clear();
        this.defs.clear();
        this.valueSet.values.length = 0;

        let customNames = files.flatMap(this.fileSelector).map(this.nameSelector);
        this.valueSet.values.push(...customNames.concat(this.defaults).map(name => ({name})));

        for (let file of files) {
            this.fileRefSelector(file).forEach((value, key) => addToKey(this.refs, key, value));
            for (let value of this.fileSelector(file)) {
                this.defs.set(this.nameSelector(value), value);
            }
        }
    }

    lookupRefs(node: Node, document: TextDocument): Location[] | undefined {
        let name = this.nodeMap.getNameDef(node, document) ?? this.nodeMap.getRefName(node, document);
        if (!name) return;
        let values = this.refs.get(name);
        return values?.map(toLocation);
    }

    lookupDef(node: Node, document: TextDocument): Location | undefined {
        let name = this.nodeMap.getNameDef(node, document) ?? this.nodeMap.getRefName(node, document);
        if (!name) return;
        let value = this.defs.get(name);
        if (value) return toLocation(value);
    }

    tryGetInvalidRefName(node: Node, document: TextDocument): string | undefined {
        if (this.defs.size == 0) return;

        let refName = this.nodeMap.getRefName(node, document);
        if (refName && !this.isNameValid(refName)) return refName;
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

const eventsMapper = new RefMapper<FtlEvent>(file => file.events,
    file => file.eventRefs,
    value => value.name,
    (name, file, node, document) => new FtlEvent(name, file, node, document),
    {
        getNameDef(node: Node, document: TextDocument): string | undefined {
            return events.getEventNameDef(node);
        },
        getRefName(node: Node, document: TextDocument): string | undefined {
            return events.getEventRefName(node, document);
        }
    },
    EventNamesValueSet,
    "Event",
    defaultEvents);

const shipsMapper = new RefMapper(file => file.ships,
    file => file.shipRefs,
    value => value.name,
    (name, file, node, document) => new FtlShip(name, file, node, document),
    {
        getNameDef(node: Node, document: TextDocument): string | undefined {
            return ships.getNameDef(node);
        },
        getRefName(node: Node, document: TextDocument): string | undefined {
            return ships.getRefName(node);
        }
    },
    ShipNames,
    "Ship",
    defaultShips);

export const mappers: RefMapperBase[] = [eventsMapper, shipsMapper];
