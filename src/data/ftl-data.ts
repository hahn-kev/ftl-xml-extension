import {
    HTMLDataV1,
    IAttributeData,
    IValueSet
} from 'vscode-html-languageservice';

// type XmlTag = ITagData & { tags?: string[] };
type XmlData = HTMLDataV1
// & { tags: XmlTag[] }
    ;

function boolAttr(name: string): IAttributeData {
    return {name: name, valueSet: 'bool'};
}

export const EventNamesValueSet: IValueSet = {
    name: 'event-names',
    values: [{name: 'loading...'}]
};

export const ShipNames: IValueSet = {
    name: 'ship-names',
    values: [{name: 'loading...'}]
};

export const AutoblueprintNames: IValueSet = {
    name: 'blueprint-names',
    values: [{name: 'loading...'}]
}

export const TextIdNames: IValueSet = {
    name: 'text-id-names',
    values: [{name: 'loading...'}]
};

export const WeaponNames: IValueSet = {
    name: 'weapon-names',
    values: [{name: 'loading...'}]
}
export const DroneNames: IValueSet = {
    name: 'drone-names',
    values: [{name: 'loading...'}]
}

export const FtlData: XmlData = {
    version: 1.1,
    tags: [
        {
            name: 'event',
            attributes: [
                {name: 'name'},
                boolAttr('hidden'),
                boolAttr('unique'),
                {name: 'load', valueSet: EventNamesValueSet.name}
            ]
        },
        {
            name: 'choice',
            description: 'encloses the choice text and event for each choice in an event',
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
        {
            name: 'loadEvent',
            attributes: []
        },
        {
            name: "ship",
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
        {
            name: 'blueprintList',
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
            name: 'destroyed',
            attributes: [{name: 'load', valueSet: EventNamesValueSet.name}]
        },
        {
            name: 'deadCrew',
            attributes: [{name: 'load', valueSet: EventNamesValueSet.name}]
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
            attributes: [{name: 'name'}]
        },
        {name: "quest", attributes: [{name: 'event'}]},
        {name: "environment", attributes: []},
        {name: "weapon", attributes: [{name: 'name', valueSet: WeaponNames.name}]},
        {name: 'weaponBlueprint', attributes: [{name: 'name'}]},
        {name: "unlockCustomShip", attributes: []},
        {name: "autoReward", attributes: [{name: 'level'}]},
        {name: "item_modify", attributes: []},
        {
            name: "damage",
            attributes: [{name: 'amount'}, {name: 'system'}, {name: 'effect'}]
        },
        {name: "upgrade", attributes: []},
        {name: "modifyPursuit", attributes: []},
        {name: "crewMember", attributes: [{name: 'class'}, {name: 'amount'}]},
        {name: "img", attributes: []},
        {name: "removeCrew", attributes: []},
        {name: "status", attributes: []},
        {name: "distressBeacon", attributes: []},
        {name: "restartEvent", attributes: []},
        {name: "drone", attributes: [{name: 'name', valueSet: DroneNames.name}]},
        {name: "beaconType", attributes: []},
        {name: "recallBoarders", attributes: []},
        {name: "loadEvent", attributes: []},
        {name: "instantEscape", attributes: []},
        {name: "customFleet", attributes: []},
        {name: "preventQuest", attributes: []},
        {name: "preventFleet", attributes: []},
        {name: "augment", attributes: []},
        {name: "store", attributes: []},
        {name: "triggeredEvent", attributes: []},
        {name: "hiddenAug", attributes: []},
        {
            name: "boarders",
            attributes: [{name: 'class'}, {name: 'min'}, {name: 'max'}]
        },
        {name: "remove", attributes: []},
        {name: "reveal_map", attributes: []},
        {name: "surrender", attributes: []},
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
    ],
    valueSets: [
        {name: 'bool', values: [{name: 'true'}, {name: 'false'}]},
        EventNamesValueSet,
        ShipNames,
        AutoblueprintNames,
        TextIdNames,
        WeaponNames,
        DroneNames
    ]
};
