import {RefMapper, RefMapperBase,} from './ref-mapper';
import {FtlEvent} from '../models/ftl-event';
import {Node} from 'vscode-html-languageservice';
import {Position, TextDocument} from 'vscode';
import {events} from '../events';
import {getAttrValueForTag} from '../helpers';
import {
    AutoblueprintNames,
    EventNamesValueSet,
    ShipNames,
    TextIdNames,
    WeaponNames
} from '../data/ftl-data';
import {defaultEvents} from '../data/default-events';
import {FtlShip} from '../models/ftl-ship';
import {defaultShips} from '../data/default-ships';
import {FtlWeapon} from '../models/ftl-weapon';
import {FtlAutoblueprint} from '../models/ftl-autoblueprint';
import {defaultAutoBlueprints} from '../data/default-auto-blueprints';
import {FtlText} from '../models/ftl-text';
import {BlueprintMapper} from './blueprint-mapper';
import {DocumentCache} from '../document-cache';

export namespace mappers {

    export const eventsMapper = new RefMapper(file => file.events,
        file => file.eventRefs,
        (name, file, node, document) => new FtlEvent(name, file, node, document),
        {
            getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
                return events.getEventNameDef(node, document, position);
            },
            getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
                return events.getEventRefName(node, document, position)
                    ?? getAttrValueForTag(node, 'destroyed', 'load', document, position)
                    ?? getAttrValueForTag(node, 'deadCrew', 'load', document, position);
            }
        },
        EventNamesValueSet,
        "Event",
        defaultEvents);

    export const shipsMapper = new RefMapper(file => file.ships,
        file => file.shipRefs,
        (name, file, node, document) => new FtlShip(name, file, node, document),
        {
            getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
                return getAttrValueForTag(node, 'ship', 'name', document, position);
            },
            getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
                return getAttrValueForTag(node, 'ship', 'load', document, position);
            }
        },
        ShipNames,
        "Ship",
        defaultShips);
    export const weaponsMapper = new RefMapper(file => file.weapons,
        file => file.weaponRefs,
        (name, file, node, document) => new FtlWeapon(name, file, node, document),
        {
            getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
                return getAttrValueForTag(node, 'weaponBlueprint', 'name', document, position);
            },
            getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
                return getAttrValueForTag(node, 'weapon', 'name', document, position)
            }
        },
        WeaponNames,
        "Weapon",
        []);

    export const autoBlueprintMapper = new RefMapper(file => file.autoBlueprints,
        file => file.autoBlueprintRefs,
        (name, file, node, document) => new FtlAutoblueprint(name, file, node, document),
        {
            getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
                return getAttrValueForTag(node, 'shipBlueprint', 'name', document, position);
            },
            getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
                return getAttrValueForTag(node, 'ship', 'auto_blueprint', document, position);
            }
        },
        AutoblueprintNames,
        "Auto Blueprint",
        defaultAutoBlueprints);

    export const textMapper = new RefMapper(file => file.texts,
        file => file.textRefs, (name, file, node, document) => new FtlText(name, file, node, document),
        {
            getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
                return getAttrValueForTag(node, 'text', 'name', document, position)
                    ?? getAttrValueForTag(node, 'textList', 'name', document, position);
            },
            getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
                return getAttrValueForTag(node, 'text', 'load', document, position)
                    ?? getAttrValueForTag(node, 'text', 'id', document, position);
            }
        },
        TextIdNames,
        "Text",
        []
    );

    const blueprintMappers: RefMapperBase[] = [weaponsMapper, autoBlueprintMapper];

    export function setup(documentCache: DocumentCache) {
        const blueprintMapper = new BlueprintMapper(blueprintMappers);
        const mappers: RefMapperBase[] = [
            eventsMapper,
            shipsMapper,
            textMapper,
            blueprintMapper];
        return {blueprintMapper, mappers};
    }

}
