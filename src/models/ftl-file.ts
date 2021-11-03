import {FtlEvent} from './ftl-event';
import {Uri} from 'vscode';
import {FtlShip} from './ftl-ship';
import {FtlAutoblueprint} from './ftl-autoblueprint';
import {FtlText} from './ftl-text';
import {FtlWeapon} from './ftl-weapon';

export class FtlFile {

    constructor(public uri: Uri) {
    }

    events: FtlEvent[] = [];
    eventRefs = new Map<string, FtlEvent[]>();

    ships: FtlShip[] = [];
    shipRefs = new Map<string, FtlShip[]>();

    blueprints: FtlAutoblueprint[] = [];
    blueprintRefs = new Map<string, FtlAutoblueprint[]>();

    texts: FtlText[] = [];
    textRefs = new Map<string, FtlText[]>();

    weapons: FtlWeapon[] = [];
    weaponRefs = new Map<string, FtlWeapon[]>();
}
