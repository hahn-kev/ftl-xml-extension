import {FtlFile} from '../models/ftl-file';
import {FtlShip} from '../models/ftl-ship';
import {IValueData, IValueSet} from 'vscode-html-languageservice';
import {EventNamesValueSet, ShipNames} from '../data/ftl-data';
import {defaultEvents} from '../data/default-events';
import {defaultShips} from '../data/default-ships';

export interface RefMapperBase {
    updateData(files: FtlFile[]): void;
}

export class RefMapper<T> implements RefMapperBase {

    constructor(private fileSelector: (file: FtlFile) => T[],
                private nameSelector: (value: T) => string,
                public valueSet: IValueSet,
                private defaults: readonly string[] = []) {
    }

    updateData(files: FtlFile[]) {
        this.valueSet.values.length = 0;
        let customNames = files.flatMap(this.fileSelector).map(this.nameSelector);
        this.valueSet.values.push(...customNames.concat(this.defaults).map(name => ({name})));
    }
}

const eventsMapper = new RefMapper(file => file.events, value => value.name, EventNamesValueSet, defaultEvents);
const shipsMapper = new RefMapper(file => file.ships, value => value.name, ShipNames, defaultShips);

export const mappers: RefMapperBase[] = [eventsMapper, shipsMapper];
