import {
    HTMLDataV1,
    IAttributeData, ITagData,
    IValueSet
} from 'vscode-html-languageservice';
import {
    AugmentNames,
    AutoblueprintNames, CrewNames, DroneNames,
    EventNamesValueSet,
    ShipNames, TextIdNames, WeaponNames
} from './autocomplete-value-sets';

export interface XmlTag extends ITagData {
    tags?: string[] | undefined;
    requiredTags?: string[]
}

type XmlData = HTMLDataV1 & { tags: XmlTag[] };

function boolAttr(name: string): IAttributeData {
    return {name: name, valueSet: 'bool'};
}

let hyperspaceEventChildren: XmlTag[] = [
    {name: "beaconType", attributes: []},
    {name: "recallBoarders", attributes: []},
    {name: "instantEscape", attributes: []},
    {name: "customFleet", attributes: []},
    {name: "unlockCustomShip", attributes: []},
    {name: "preventQuest", attributes: []},
    {name: "preventFleet", attributes: []},
    {name: 'remove', attributes: [{name: 'name'}]}
];
let eventChildTags: XmlTag[] = [
    // ...allow XML tags of these types to be nested inside:
    {name: "event", attributes: []},
    {name: "environment", attributes: []},
    {name: "fleet", attributes: []},
    {name: "img", attributes: []},
    {name: "distressBeacon", attributes: []},
    {name: "store", attributes: []},
    {name: "ship", attributes: []},
    {name: "repair", attributes: []},
    {name: "autoReward", attributes: []},
    {name: "augment", attributes: []},
    {name: "weapon", attributes: []},
    {name: "drone", attributes: []},
    {name: "damage", attributes: []},
    {name: "boarders", attributes: []},
    {name: "reveal_map", attributes: []},
    {name: "modifyPursuit", attributes: []},
    {name: "quest", attributes: []},
    {name: "unlockShip", attributes: []},
    {name: "item_modify", attributes: []},
    {name: "status", attributes: []},
    {name: "secretSector", attributes: []},
    {
        name: "removeCrew",
        attributes: [{
            name: 'class',
            valueSet: CrewNames.name
        }]
    },
    {name: "upgrade", attributes: []},
    ...hyperspaceEventChildren
];
let eventChildTagNames = eventChildTags.map(t => t.name);
eventChildTagNames.push('choice', 'text', 'crewMember');

let shipTags: XmlTag[] = [
    {name: 'weaponOverride', attributes: [], tags: ['name']},
    {
        name: 'destroyed',
        tags: eventChildTagNames,
        attributes: [{name: 'load', valueSet: EventNamesValueSet.name}]
    },
    {
        name: 'deadCrew',
        tags: eventChildTagNames,
        attributes: [{name: 'load', valueSet: EventNamesValueSet.name}]
    },
    {
        name: "surrender",
        tags: eventChildTagNames,
        attributes: [{name: 'load', valueSet: EventNamesValueSet.name}]
    },
    {
        name: "escape",
        tags: eventChildTagNames,
        attributes: [{name: 'load', valueSet: EventNamesValueSet.name}]
    },
    {
        name: "gotaway",
        tags: eventChildTagNames,
        attributes: [{name: 'load', valueSet: EventNamesValueSet.name}]
    },
    {name: "crew", attributes: [], tags: ["crewMember"]},
];
let shipTagNames = [...shipTags.map(t => t.name), 'crewMember'];

export const FtlData: XmlData = {
    version: 1.1,
    tags: [
        {
            name: 'event',
            tags: eventChildTagNames,
            attributes: [
                {name: 'name'},
                boolAttr('hidden'),
                boolAttr('unique'),
                {name: 'load', valueSet: EventNamesValueSet.name}
            ],
        },
        {
            name: 'choice',
            description: 'encloses the choice text and event for each choice in an event',
            tags: eventChildTagNames,
            requiredTags: ['text'],
            attributes: [
                boolAttr('unique'),
                {
                    name: 'hidden',
                    valueSet: 'bool',
                    description: ` if marked true, the choice's rewards will not be displayed before selecting the event. By default set to false. (usually set to true unless its an event where a trade is made, so that you can see the exact values of what is being traded)`
                },
                {name: "req"},
                {name: "lvl"},
                boolAttr('blue'),
                {name: "max_group"},
                {name: "max_lvl"},
                {name: "min_level"}
            ]
        },
        //event tags
        ...eventChildTags,

        //ship tags
        {
            name: "ship",
            tags: shipTagNames,
            attributes: [
                {
                    name: 'load',
                    valueSet: ShipNames.name
                },
                {
                    name: 'auto_blueprint',
                    valueSet: AutoblueprintNames.name
                },
                {name: 'name'},
                boolAttr('hostile')
            ]
        },
        ...shipTags,
        {
            name: 'loadEvent',
            attributes: [],
        },
        {
            name: 'blueprintList',
            tags: ['name'],
            attributes: [
                {name: 'name'}
            ]
        },
        {
            name: 'shipBlueprint',
            attributes: [
                {name: 'name'}
            ]
        },
        {
            name: 'crewBlueprint',
            attributes: [
                {name: 'name'}
            ],
            tags: [
                "desc", "cost", "title", "short", "rarity", "powerList", "bp", "colorList"
            ]
        },
        {
            name: 'systemBlueprint',
            attributes: [
                {name: 'name'}
            ],
            tags: [
                "type", "title", "desc", "startPower", "maxPower", "rarity", "upgradeCost",
                "cost", "locked", "bp"
            ]
        },
        {
            name: "text",
            attributes: [
                {name: 'name'},
                {name: 'id', valueSet: TextIdNames.name},
                {name: 'load', valueSet: TextIdNames.name}
            ]
        },
        {
            name: 'textList',
            attributes: [{name: 'name'}],
            tags: ["text"]
        },
        {name: "quest", attributes: [{name: 'event'}]},
        {name: "environment", attributes: []},
        {
            name: "weapon",
            attributes: [{name: 'name', valueSet: WeaponNames.name}]
        },
        {
            name: 'weaponBlueprint',
            tags: [
                "type", "title", "short", "locked", "desc", "tooltip", "damage", "ion", "sysDamage",
                "persDamage", "speed", "missiles", "shots", "length", "lockdown", "sp", "fireChance",
                "breachChance", "stunChance", "hullBust", "cooldown", "power", "cost", "bp", "rarity",
                "image", "explosion", "launchSounds", "hitShipSounds", "hitShieldSounds", "missSounds",
                "weaponArt", "tip", "iconImage", "color", "drone_targetable", "flavorType", "radius",
                "spin", "projectiles", "chargeLevels", "boost", "stun"
            ],
            attributes: [{name: 'name'}]
        },
        {name: 'droneBlueprint', attributes: [{name: 'name'}]},
        {name: 'augmentBlueprint', attributes: [{name: 'name'}]},
        {name: "unlockCustomShip", attributes: []},
        {name: "autoReward", attributes: [{name: 'level'}]},
        {name: "item_modify", attributes: [], tags: ['item']},
        {
            name: "damage",
            attributes: [{name: 'amount'}, {name: 'system'}, {name: 'effect'}]
        },
        {name: "upgrade", attributes: []},
        {name: "modifyPursuit", attributes: []},
        {
            name: "crewMember",
            attributes: [
                {name: 'amount'},
                {
                    name: 'class',
                    valueSet: CrewNames.name
                },
                {
                    name: 'type',
                    valueSet: CrewNames.name
                }]
        },
        {name: "img", attributes: []},
        {
            name: "removeCrew",
            attributes: [],
            tags: [...eventChildTagNames, "clone"]
        },
        {name: "status", attributes: []},
        {name: "distressBeacon", attributes: []},
        {name: "restartEvent", attributes: []},
        {
            name: "drone",
            attributes: [{name: 'name', valueSet: DroneNames.name}]
        },
        {name: "beaconType", attributes: []},
        {name: "recallBoarders", attributes: []},
        {name: "loadEvent", attributes: []},
        {name: "instantEscape", attributes: []},
        {name: "customFleet", attributes: []},
        {name: "preventQuest", attributes: []},
        {name: "preventFleet", attributes: []},
        {
            name: "augment",
            attributes: [{name: 'name', valueSet: AugmentNames.name}]
        },
        {name: "store", attributes: []},
        {name: "triggeredEvent", attributes: []},
        {name: "hiddenAug", attributes: []},
        {
            name: "boarders",
            attributes: [{name: 'class'}, {name: 'min'}, {name: 'max'}]
        },
        {name: "remove", attributes: []},
        {name: "reveal_map", attributes: []},
        {name: "aggressive", attributes: []},
        {name: "removeHazards", attributes: []},
        {name: "secretSectorWarp", attributes: []},
        {name: "secretSector", attributes: []},
        {name: "checkCargo", attributes: []},
        {name: "transformRace", attributes: []},
        {name: "changeBackground", attributes: []},
        {name: "playSound", attributes: []},
        {name: "jumpEvent", attributes: []},
        {name: "clearTriggeredEvent", attributes: []},
        {name: "enemyDamage", attributes: []},
        {name: "lose", attributes: []},
        {name: "fleet", attributes: []},
        {name: "system", attributes: []},
        {name: "noQuestText", attributes: []},
        {name: "replaceSector", attributes: []},
        {name: "superBarrage", attributes: []},
        {name: "superDrones", attributes: []},
        {name: "clearSuperDrones", attributes: []},
        {name: "removeItem", attributes: []},
        {name: "loadEventList", attributes: []},
        {name: "superShields", attributes: []},
        {name: "runFromFleet", attributes: []},
        {name: "preventBossFleet", attributes: []},
        {name: "resetFtl", attributes: []},
        {name: "win", attributes: []},
        {name: "disableScrapScore", attributes: []},
        {name: "unlockShip", attributes: []},
        {name: "eventList", attributes: [], tags: ["event"]}
    ],
    valueSets: [
        {name: 'bool', values: [{name: 'true'}, {name: 'false'}]},
        EventNamesValueSet,
        ShipNames,
        AutoblueprintNames,
        TextIdNames,
        WeaponNames,
        DroneNames,
        AugmentNames,
        CrewNames
    ]
};
