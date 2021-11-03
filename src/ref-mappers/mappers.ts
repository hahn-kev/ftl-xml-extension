import {
    RefMapper,
    RefMapperBase,
} from './ref-mapper';
import {FtlEvent} from '../models/ftl-event';
import {Node} from 'vscode-html-languageservice';
import {TextDocument} from 'vscode';
import {events} from '../events';
import {getAttrValueForTag} from '../helpers';
import {
    AutoblueprintNames,
    EventNamesValueSet,
    ShipNames, TextIdNames,
    WeaponNames
} from '../data/ftl-data';
import {defaultEvents} from '../data/default-events';
import {FtlShip} from '../models/ftl-ship';
import {ships} from '../ships';
import {defaultShips} from '../data/default-ships';
import {FtlWeapon} from '../models/ftl-weapon';
import {FtlAutoblueprint} from '../models/ftl-autoblueprint';
import {defaultBlueprints} from '../data/default-blueprints';
import {FtlText} from '../models/ftl-text';

export const eventsMapper = new RefMapper<FtlEvent>(file => file.events,
    file => file.eventRefs,
    value => value.name,
    (name, file, node, document) => new FtlEvent(name, file, node, document),
    {
        getNameDef(node: Node, document: TextDocument): string | undefined {
            return events.getEventNameDef(node);
        },
        getRefName(node: Node, document: TextDocument): string | undefined {
            return events.getEventRefName(node, document)
                ?? getAttrValueForTag(node, 'destroyed', 'load')
                ?? getAttrValueForTag(node, 'deadCrew', 'load');
        }
    },
    EventNamesValueSet,
    "Event",
    defaultEvents);

export const shipsMapper = new RefMapper(file => file.ships,
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
export const weaponsMapper = new RefMapper(file => file.weapons,
    file => file.weaponRefs,
    value => value.name,
    (name, file, node, document) => new FtlWeapon(name, file, node, document),
    {
        getNameDef(node: Node, document: TextDocument): string | undefined {
            return getAttrValueForTag(node, 'weaponBlueprint', 'name') ?? getAttrValueForTag(node, 'blueprintList', 'name');
        },
        getRefName(node: Node, document: TextDocument): string | undefined {
            return getAttrValueForTag(node, 'weapon', 'name')
        }
    },
    WeaponNames,
    "Weapon",
    []);

export const blueprintMapper = new RefMapper(file => file.blueprints,
    file => file.blueprintRefs,
    value => value.name,
    (name, file, node, document) => new FtlAutoblueprint(name, file, node, document),
    {
        getNameDef(node: Node, document: TextDocument): string | undefined {
            return getAttrValueForTag(node, 'shipBlueprint', 'name') ?? getAttrValueForTag(node, 'blueprintList', 'name');
        },
        getRefName(node: Node, document: TextDocument): string | undefined {
            return getAttrValueForTag(node, 'ship', 'auto_blueprint');
        }
    },
    AutoblueprintNames,
    "Auto Blueprint",
    defaultBlueprints);

export const textMapper = new RefMapper(file => file.texts,
    file => file.textRefs, value => value.name,
    (name, file, node, document) => new FtlText(name, file, node, document),
    {
        getNameDef(node: Node, document: TextDocument): string | undefined {
            return getAttrValueForTag(node, 'text', 'name') ?? getAttrValueForTag(node, 'textList', 'name');
        },
        getRefName(node: Node, document: TextDocument): string | undefined {
            return getAttrValueForTag(node, 'text', 'load') ?? getAttrValueForTag(node, 'text', 'id');
        }
    },
    TextIdNames,
    "Text",
    []
);

export const mappers: RefMapperBase[] = [eventsMapper, shipsMapper, blueprintMapper, textMapper, weaponsMapper];
