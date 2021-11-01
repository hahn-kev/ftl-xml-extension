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

    provideRefs(node: Node, document: TextDocument): Location[] | undefined;
}

interface NodeMap {
    getName(node: Node, document: TextDocument): string | undefined;
}

export class RefMapper<T extends {file: FtlFile, position: Position}> implements RefMapperBase {
    refs = new Map<string, T[]>();

    constructor(private fileSelector: (file: FtlFile) => T[],
                private fileRefSelector: (file: FtlFile) => Map<string, T[]>,
                private nameSelector: (value: T) => string,
                private nodeMap: NodeMap,
                public valueSet: IValueSet,
                private defaults: readonly string[] = []) {
    }

    updateData(files: FtlFile[]) {
        this.refs.clear();
        this.valueSet.values.length = 0;

        let customNames = files.flatMap(this.fileSelector).map(this.nameSelector);
        this.valueSet.values.push(...customNames.concat(this.defaults).map(name => ({name})));

        for (let file of files) {
            this.fileRefSelector(file).forEach((value, key) => addToKey(this.refs, key, value));
        }
    }

    provideRefs(node: Node, document: TextDocument): Location[] | undefined {
        let name = this.nodeMap.getName(node, document);
        if (!name) return;
        let values = this.refs.get(name);
        return values?.map(toLocation);
    }
}

const eventsMapper = new RefMapper<FtlEvent>(file => file.events,
    file => file.eventRefs,
    value => value.name,
    {
        getName(node: Node, document: TextDocument): string | undefined {
            return events.getEventName(node, document);
        }
    },
    EventNamesValueSet,
    defaultEvents);

const shipsMapper = new RefMapper(file => file.ships,
    file => file.shipRefs,
    value => value.name,
    {
        getName(node: Node, document: TextDocument): string | undefined {
            return ships.getNameDef(node) ?? ships.getRefName(node);
        }
    },
    ShipNames,
    defaultShips);

export const mappers: RefMapperBase[] = [eventsMapper, shipsMapper];
