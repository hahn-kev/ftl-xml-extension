import {FtlEvent} from './ftl-event';
import {Uri} from 'vscode';
import {FtlShip} from './ftl-ship';

export interface FtlFile {
    uri: Uri;
    events: FtlEvent[];
    eventRefs: Map<string, FtlEvent[]>;

    ships: FtlShip[];
    shipRefs: Map<string, FtlShip[]>;
}
