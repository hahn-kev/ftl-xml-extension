import {RefMapper, RefMapperBase,} from './ref-mapper';
import {FtlEvent} from '../models/ftl-event';
import {Node} from 'vscode-html-languageservice';
import {Position, TextDocument} from 'vscode';
import {events} from '../events';
import {
    fileName,
    getAttrValueForTag,
    getNodeTextContent,
    hasAncestor,
    hasAttr,
    normalizeAttributeName
} from '../helpers';
import {
    AugmentNames,
    AutoblueprintNames,
    CrewNames,
    DroneNames,
    EventNamesValueSet,
    ShipNames,
    SoundNames,
    SystemNames,
    TextIdNames,
    WeaponNames
} from '../data/autocomplete-value-sets';
import {defaultEvents} from '../data/default-events';
import {FtlShip} from '../models/ftl-ship';
import {defaultShips} from '../data/default-ships';
import {FtlWeapon} from '../models/ftl-weapon';
import {FtlAutoblueprint} from '../models/ftl-autoblueprint';
import {defaultAutoBlueprints} from '../data/default-auto-blueprints';
import {FtlText} from '../models/ftl-text';
import {BlueprintMapper} from './blueprint-mapper';
import {DocumentCache} from '../document-cache';
import {defaultWeaponBlueprints} from '../data/default-weapon-blueprints';
import {FtlDrone} from '../models/ftl-drone';
import {defaultDrones} from '../data/default-drones';
import {FtlAugment} from '../models/ftlAugment';
import {defaultAugments} from '../data/default-augments';
import {FtlCrew} from '../models/ftl-crew';
import {defaultCrew} from '../data/default-crew';
import {FtlSystem} from '../models/ftl-system';
import {defaultSystems} from '../data/default-systems';
import {defaultText} from '../data/default-text';
import {RefParser} from './ref-parser';
import {FtlSound} from '../models/ftl-sound';
import {defaultSounds} from '../data/default-sounds';

export namespace mappers {

    export const eventsMapper = new RefMapper(new RefParser(file => file.event, FtlEvent, events),
        EventNamesValueSet,
        'Event',
        defaultEvents);

    export const shipsMapper = new RefMapper(new RefParser(
            file => file.ship,
            FtlShip,
            {
                getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
                    return getAttrValueForTag(node,
                        'ship',
                        'name',
                        document,
                        position);
                },
                getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
                    if (node.tag == "ship" && node.parent?.tag == "shipOrder") return getNodeTextContent(node, document);
                    return getAttrValueForTag(node,
                        'ship',
                        'load',
                        document,
                        position);
                }
            }
        ),
        ShipNames,
        'Ship',
        defaultShips);

    export const weaponsMapper = new RefMapper(new RefParser(
            file => file.weapon,
            FtlWeapon,
            {
                getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
                    return getAttrValueForTag(node,
                        'weaponBlueprint',
                        'name',
                        document,
                        position);
                },
                getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {

                    let name = getAttrValueForTag(node,
                        'weapon',
                        'name',
                        document,
                        position);
                    if (name) return name;
                    if (node.tag == 'weaponBlueprint' && node.parent?.tag == 'droneBlueprint' && !node.attributes)
                        return getNodeTextContent(node, document);
                }
            }
        ),
        WeaponNames,
        'Weapon',
        defaultWeaponBlueprints);

    export const dronesMapper = new RefMapper(new RefParser(
            file => file.drone,
            FtlDrone,
            {
                getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
                    return getAttrValueForTag(node,
                        'droneBlueprint',
                        'name',
                        document,
                        position);
                },
                getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
                    return getAttrValueForTag(node,
                        'drone',
                        'name',
                        document,
                        position);
                }
            }
        ),
        DroneNames,
        'Drone',
        defaultDrones);

    export const augmentsMapper = new RefMapper(new RefParser(
            file => file.augment,
            FtlAugment,
            {
                getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
                    return getAttrValueForTag(node,
                        'augBlueprint',
                        'name',
                        document,
                        position);
                },
                getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
                    return getAttrValueForTag(node,
                            'augment',
                            'name',
                            document,
                            position)
                        ?? getAttrValueForTag(node,
                            'aug',
                            'name',
                            document,
                            position);
                }
            }
        ),
        AugmentNames,
        'Augment',
        defaultAugments);

    export const crewMapper = new RefMapper(new RefParser(
            file => file.crews,
            FtlCrew,
            {
                getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
                    return getAttrValueForTag(node,
                        'crewBlueprint',
                        'name',
                        document,
                        position);
                },
                getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
                    return getAttrValueForTag(node,
                            'crewMember',
                            'class',
                            document,
                            position)
                        ?? getAttrValueForTag(node,
                            'crewMember',
                            'type',
                            document,
                            position)
                        ?? getAttrValueForTag(node,
                            'removeCrew',
                            'class',
                            document,
                            position);
                }
            }
        ),
        CrewNames,
        'Crew',
        defaultCrew);

    export const systemMapper = new RefMapper(new RefParser(
            file => file.system,
            FtlSystem,
            {
                getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
                    return getAttrValueForTag(node,
                        'systemBlueprint',
                        'name',
                        document,
                        position);
                },
                getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
                    return getAttrValueForTag(node, 'status', 'system', document, position) ??
                        getAttrValueForTag(node, 'upgrade', 'system', document, position) ??
                        getAttrValueForTag(node, 'damage', 'system', document, position);
                }
            }
        ),
        SystemNames,
        'System',
        defaultSystems);

    export const autoBlueprintMapper = new RefMapper(new RefParser(
            file => file.autoBlueprint,
            FtlAutoblueprint,
            {
                getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
                    return getAttrValueForTag(node, 'shipBlueprint', 'name', document, position);
                },
                getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
                    return getAttrValueForTag(node, 'ship', 'auto_blueprint', document, position) ?? getNodeTextContent(node, document, 'bossShip');
                }
            }
        ),
        AutoblueprintNames,
        'Auto Blueprint',
        defaultAutoBlueprints);

    export const textMapper = new RefMapper(new RefParser(
            file => file.text,
            FtlText,
            {
                getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {

                    if (node.tag == 'text' && hasAttr(node, 'name', document, position)) {
                        //filter out language files
                        if (fileName(document)?.startsWith('text-'))
                            return undefined;
                        return normalizeAttributeName(node.attributes.name);
                    }

                    return getAttrValueForTag(node, 'textList', 'name', document, position);
                },
                getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
                    return getAttrValueForTag(node, 'text', 'load', document, position)
                        ?? getAttrValueForTag(node, 'text', 'name', document, position)
                        ?? getAttrValueForTag(node, 'text', 'id', document, position)
                        ?? getAttrValueForTag(node, 'title', 'id', document, position)
                        ?? getAttrValueForTag(node, 'short', 'id', document, position)
                        ?? getAttrValueForTag(node, 'desc', 'id', document, position)
                        ?? getAttrValueForTag(node, 'tooltip', 'id', document, position)
                        ?? getNodeTextContent(node, document, 'tip');
                }
            }
        ),
        TextIdNames,
        'Text',
        defaultText);

    const validSoundFileNames = ['dlcSounds.xml', 'dlcSounds.xml.append', 'sounds.xml', 'sounds.xml.append'];
    export const soundMapper = new RefMapper(
        new RefParser(file => file.sounds,
            FtlSound,
            {
                getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
                    if (!node.tag || node.tag == 'FTL') return;
                    let docFileName = fileName(document);
                    if (docFileName && validSoundFileNames.includes(docFileName) && !hasAncestor(node, 'music', true)) {
                        return node.tag;
                    }
                },
                getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
                    return getNodeTextContent(node, document, 'sound')
                        ?? getNodeTextContent(node, document, 'powerSound')
                        ?? getNodeTextContent(node, document, 'shootingSound')
                        ?? getNodeTextContent(node, document, 'deathSound')
                        ?? getNodeTextContent(node, document, 'finishSound')
                        ?? getNodeTextContent(node, document, 'repairSound')
                        ?? getNodeTextContent(node, document, 'timerSound');
                }
            }),
        SoundNames,
        'Sound',
        defaultSounds
    );

    const blueprintMappers: RefMapperBase[] = [
        weaponsMapper,
        autoBlueprintMapper,
        dronesMapper,
        augmentsMapper,
        crewMapper,
        systemMapper
    ];

    export function setup(documentCache: DocumentCache) {
        const blueprintMapper = new BlueprintMapper(blueprintMappers);
        const mappers: RefMapperBase[] = [
            eventsMapper,
            shipsMapper,
            textMapper,
            soundMapper,
            blueprintMapper
        ];
        return {blueprintMapper, mappers};
    }

}
