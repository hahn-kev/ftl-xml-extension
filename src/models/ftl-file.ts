import {FtlEvent} from './ftl-event';
import {Uri} from 'vscode';
import {FtlShip} from './ftl-ship';
import {FtlAutoblueprint} from './ftl-autoblueprint';
import {FtlText} from './ftl-text';

export interface FtlFile {
    uri: Uri;
    events: FtlEvent[];
    eventRefs: Map<string, FtlEvent[]>;

    ships: FtlShip[];
    shipRefs: Map<string, FtlShip[]>;

    blueprints: FtlAutoblueprint[];
    blueprintRefs: Map<string, FtlAutoblueprint[]>;

    texts: FtlText[];
    textRefs: Map<string, FtlText[]>;
}
