import {FtlEvent} from './ftl-event';
import {Uri} from 'vscode';
import {FtlShip} from './ftl-ship';
import {FtlAutoblueprint} from './ftl-autoblueprint';
import {FtlText} from './ftl-text';
import {FtlWeapon} from './ftl-weapon';
import {FtlBlueprintList} from './ftl-blueprint-list';
import {FtlDrone} from './ftl-drone';
import {FtlValue} from './ftl-value';
import {FtlAugment} from './ftlAugment';
import {FtlCrew} from './ftl-crew';
import {FtlSystem} from './ftl-system';
import {addToKey} from '../helpers';



export class FtlFile {
    constructor(public uri: Uri) {
    }

    event = new FtlFileValue<FtlEvent>();
    ship = new FtlFileValue<FtlShip>();
    autoBlueprint = new FtlFileValue<FtlAutoblueprint>();
    text = new FtlFileValue<FtlText>();
    weapon = new FtlFileValue<FtlWeapon>();
    drone = new FtlFileValue<FtlDrone>();
    augment = new FtlFileValue<FtlAugment>();
    crews = new FtlFileValue<FtlCrew>();
    system = new FtlFileValue<FtlSystem>();
    blueprintList = new FtlFileValue<FtlBlueprintList, FtlValue>();

}

export class FtlFileValue<TDef extends FtlValue, TRef extends FtlValue = TDef> {
    defs: TDef[] = [];
    refs = new Map<string, TRef[]>();

    addRef(name: string, value: TRef) {
        addToKey(this.refs, name, value);
    }
}
