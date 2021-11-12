import {HTMLDataV1, IAttributeData, ITagData} from 'vscode-html-languageservice';
import {
    AugmentNames,
    AutoblueprintNames,
    CrewNames,
    DroneNames,
    EventNamesValueSet,
    ShipNames,
    SystemNames,
    TextIdNames,
    WeaponNames
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
    {name: "environment", attributes: []},
    {name: "fleet", attributes: []},
    {name: "distressBeacon", attributes: []},
    {name: "repair", attributes: []},
    {name: "autoReward", attributes: [{name: 'level'}]},
    {
        name: "boarders",
        attributes: [{name: 'class'}, {name: 'min'}, {name: 'max'}]
    },
    {name: "reveal_map", attributes: []},
    {name: "modifyPursuit", attributes: []},
    {name: "quest", attributes: [{name: 'event'}]},
    {name: "unlockShip", attributes: []},
    {name: "item_modify", attributes: [], tags: ['item']},
    {name: "secretSector", attributes: []},
    {name: "upgrade", attributes: []},
    ...hyperspaceEventChildren
];
let eventChildTagNames = eventChildTags.map(t => t.name);
eventChildTagNames.push('choice',
    'text',
    'crewMember',
    'ship',
    'event',
    'weapon',
    'damage',
    'img',
    'removeCrew',
    'status',
    'drone',
    'augment',
    'store');

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

export const BlueprintListTypeAny = 'any';
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
            name: 'blueprintList',
            tags: ['name'],
            attributes: [
                {name: 'name'},
                {name: 'type', values: [{name: BlueprintListTypeAny}]}
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
        {
            name: "damage",
            attributes: [{name: 'amount'}, {name: 'system'}, {name: 'effect'}]
        },
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
            attributes: [{
                name: 'class',
                valueSet: CrewNames.name
            }],
            tags: [...eventChildTagNames, "clone"]
        },
        {name: "status", attributes: [{name: 'system', valueSet: SystemNames.name}]},
        {name: "restartEvent", attributes: []},
        {
            name: "drone",
            attributes: [{name: 'name', valueSet: DroneNames.name}]
        },
        {name: "loadEvent", attributes: []},
        {
            name: "augment",
            attributes: [{name: 'name', valueSet: AugmentNames.name}]
        },
        {name: "store", attributes: []},
        {name: "triggeredEvent", attributes: []},
        {name: "hiddenAug", attributes: []},

        {name: "aggressive", attributes: []},
        {name: "removeHazards", attributes: []},
        {name: "secretSectorWarp", attributes: []},
        {name: "checkCargo", attributes: []},
        {name: "transformRace", attributes: []},
        {name: "changeBackground", attributes: []},
        {name: "playSound", attributes: []},
        {name: "jumpEvent", attributes: []},
        {name: "clearTriggeredEvent", attributes: []},
        {name: "enemyDamage", attributes: []},
        {name: "lose", attributes: []},
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
