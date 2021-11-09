
let gib = [
    "velocity", "direction", "angular", "glowOffset", "x", "y"
];
type AllowedChildrenType = { [key: string]: Set<string> };

export const allowedChildrenMap: AllowedChildrenType = Object.fromEntries(Object.entries({
    // This file lists tag names that are allowed to be nested inside other tags
    // If a tag is found inside another, but is not found on a list in this file,
    // it'll be reported as an error.






    "projectiles": [
        "projectile"
    ],

    "boost": [
        "type", "amount", "count"
    ],

    "itemBlueprint": [
        "type", "title", "desc", "cost", "rarity"
    ],

    "augBlueprint": [
        "title", "desc", "cost", "bp", "rarity", "value", "stackable"
    ],

    "droneBlueprint": [
        "type", "level", "title", "short", "desc", "power", "cooldown", "dodge", "speed",
        "cost", "bp", "locked", "droneImage", "image", "weaponBlueprint", "rarity",
        "tooltip", "tip", "iconImage", "target"
    ],

    "shipBlueprint": [
        "class", "name", "maxSector", "minSector", "unlock", "desc", "systemList",
        "weaponSlots", "droneSlots", "weaponList", "droneList", "health", "maxPower",
        "crewCount", "aug", "shieldImage", "cloakImage", "floorImage", "boardingAI"
    ],

    "anim": [
        "sheet", "desc", "time"
    ],

    "weaponAnim": [
        "sheet", "desc", "chargedFrame", "fireFrame", "firePoint", "mountPoint",
        "delayChargeAnim", "chargeImage", "boost"
    ],

    "sectorDescription": [
        "nameList", "trackList", "rarityList", "startEvent", "event"
    ],

    "sectorType": [
        "sector"
    ],

    "nameList": [
        "name"
    ],

    "trackList": [
        "track"
    ],

    "rarityList": [
        "blueprint"
    ],

    "offsets": [
        "cloak", "floor"
    ],

    "weaponMounts": [
        "mount"
    ],

    "systemList": [
        "pilot", "oxygen", "shields", "engines", "weapons", "drones", "medbay",
        "clonebay", "doors", "mind", "hacking", "artillery", "teleporter",
        "sensors", "cloaking", "battery"
    ],

    "powerList": [
        "power"
    ],

    "colorList": [
        "layer"
    ],

    "layer": [
        "color"
    ],

    "color": [
        "r", "g", "b"
    ],

    "upgradeCost": [
        "level"
    ],

    "launchSounds": [
        "sound"
    ],

    "hitShipSounds": [
        "sound"
    ],
    "hitShieldSounds": [
        "sound"
    ],
    "missSounds": [
        "sound"
    ],

    "slot": [
        "direction", "number"
    ],

    "weaponList": [
        "weapon"
    ],

    "droneList": [
        "drone"
    ],

    "music": [
        "track"
    ],

    "track": [
        "name", "explore", "combat"
    ],

    "roomLayout": [
        "computerGlow"
    ],

    "imageList": [
        "img"
    ],

    "explosion": [
        "gib1",
        "gib2",
        "gib3",
        "gib4",
        "gib5",
        "gib6",
    ],

    "gib1": gib,
    "gib2": gib,
    "gib3": gib,
    "gib4": gib,
    "gib5": gib,
    "gib6": gib,
}).map(([tagName, children]) => [tagName, new Set(children)]));
