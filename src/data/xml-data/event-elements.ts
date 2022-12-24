/* eslint-disable max-len */
import {
  AugmentNames,
  ShipBlueprintNames,
  CrewNames,
  EventNamesValueSet,
  ImageListNames,
  SoundWaveNames,
  SystemNames,
  TextIdNames,
  AutoRewardLevelsValueSet,
  AutoRewardsValueSet,
  AllBlueprintsValueSet,
  SectorsValueSet,
  ReqNames, StoresValueSet
} from '../autocomplete-value-sets';
import {boolAttr, XmlTag} from './helpers';

const questChildren: XmlTag[] = [
  {name: 'nebulaEvent', attributes: [], contentsValueSet: EventNamesValueSet.name},
  {name: 'nebulaBeacon', attributes: [], contentsValueSet: 'bool'},
  {name: 'createNebula', attributes: [], contentsValueSet: 'bool'},
  {name: 'nextSector', attributes: [], contentsValueSet: 'bool'},
  {name: 'aggressive', attributes: []},
];
const triggerChildren: XmlTag[] = [
  {
    name: 'triggeredEventBox',
    attributes: [{name: 'load'}],
    description: `Specifies a triggeredEventBox for this triggered event. If the load attribute is specified, then defaults will be loaded from the specified definition, and individual parameters can be overwritten. Otherwise, a full definition is required. If not specified, then this triggered event will not have a box.`
  },
  {
    name: 'timerSounds',
    attributes: [{name: 'load'}],
    description: `Specifies timerSounds. If the load attribute is specified, then those timer sounds will be loaded and the ones specified here will be appended. If not specified, then this triggered event will not have any sounds.`
  },
  {
    name: 'warningMessage',
    attributes: [
      {name: 'image'},
      {name: 'id'},
      {name: 'x'},
      {name: 'y'},
      {name: 'time'},
      boolAttr('centerText'),
      boolAttr('flash'),
      {name: 'r'},
      {name: 'g'},
      {name: 'b'},
      {name: 'sound'},
      boolAttr('useWarningLine'),
    ],
    description: `Adds warningMessage which appears when remaining time is less than specified time. Warning is image warning if image is specified, text otherwise (either id or literal string). x/y for offset. RGB for text only. sound is sound to play when warning appears. useWarningLine puts the "WARNING!" header underlined with the text below it.`
  }
];
const hyperspaceEventChildren: XmlTag[] = [
  {
    name: 'beaconType',
    attributes: [],
    description: `Specifies custom beacon label type for this event. See hyperspace.xml for more`
  },
  {
    name: 'recallBoarders',
    attributes: [{name: 'ship', values: [{name: 'both'}, {name: 'player'}, {name: 'enemy'}]}],
    description: `Moves boarders off of ships. Set ship to "player" or "enemy" to get boarders off of one ship only.`
  },
  {name: 'repairAllSystems', attributes: [], description: `Fully repairs all of a player's systems.`},
  {name: 'killEnemyBoarders', attributes: [], description: `Kills all enemy crew on the player ship.`},
  {
    name: 'instantEscape',
    attributes: [],
    description: `Causes the enemy ship to jump away instantly (even if engines are destroyed, etc.).`
  },
  {
    name: 'escape',
    attributes: [],
    description: `Trigger's the enemy's normal escape sequence. Does not load the escape event.`
  },
  {
    name: 'surrender',
    attributes: [],
    description: `Trigger's the enemy's normal surrender behaviour. Does not load the surrender event.`
  },
  {
    name: 'loadEscape',
    attributes: [boolAttr('force')],
    description: `Triggers escape (including event), if the enemy was set to escape on hull threshold or if force="true".`
  },
  {
    name: 'loadSurrender',
    attributes: [boolAttr('force')],
    description: `Triggers surrender (including event), if the enemy was set to surrender on hull threshold or if force="true".`
  },
  {
    name: 'disableEscape',
    attributes: [boolAttr('force')],
    description: `Clears the enemy escape trigger. If force="true" then makes the enemy stop escaping if they were already escaping.`
  },
  {
    name: 'disableSurrender',
    attributes: [boolAttr('force')],
    description: `Clears the enemy surrender trigger. If force="true" then also clears any existing surrender flag.`
  },
  {
    name: 'customFleet',
    attributes: [boolAttr('right'), boolAttr('firing'), boolAttr('autoDarkening')],
    description: `Adds a custom fleet. If right is true, fleet comes from the right, otherwise it comes from the left. If firing is true, the fleet's bigShip will be drawn and be the source of the ASB. If autoDarkening is true, the tint will be automatically adjusted by layer.`
  },
  {name: 'clearCustomFleet', attributes: [], description: `Removes a custom fleet if one is present.`},
  {
    name: 'unlockCustomShip',
    attributes: [boolAttr('silent'), {name: 'shipReq', valueSet: ShipBlueprintNames.name}],
    contentsValueSet: ShipBlueprintNames.name,
    description: `Alias for unlockShip - If silent is true, the unlock is silent. If shipReq is specified, the unlock only occurs if the player is currently playing as that ship. This alias must be used in events.xml files.`
  },
  {name: 'achievement', attributes: [boolAttr('silent')], description: `Unlocks custom global achievement.`},
  {name: 'preventQuest', attributes: [], description: `Quest events will be prevented from overwriting this event.`},
  {
    name: 'preventFleet',
    attributes: [],
    description: `Prevents the rebel fleet from overtaking this beacon whatsoever.`
  },
  {name: 'remove', attributes: [{name: 'name'}]},
  {
    name: 'jumpEvent',
    attributes: [boolAttr('loop')],
    contentsValueSet: EventNamesValueSet.name,
    description: `Loads EVENT_NAME when the player clicks the JUMP button (or uses the hotkey). Auto-clears unless loop is true.`
  },
  {
    name: 'clearJumpEvent',
    attributes: [],
    description: `Clears the jumpEvent and allows the player to open the starmap.`
  },
  {
    name: 'restartEvent',
    attributes: [],
    description: `Loads the original beacon event. This load does not process Hyperspace tags that normally get processed on event load.`
  },
  {
    name: 'renameBeacon',
    attributes: [],
    contentsValueSet: EventNamesValueSet.name,
    description: `Changes the beacon's event ID to the contents of the tag, to use its <beaconType>, its <revisitEvent>, etc.`
  },
  {
    name: 'triggeredEvent',
    attributes: [
      {name: 'name'},
      {name: 'event', valueSet: EventNamesValueSet.name},
      boolAttr('seeded'),
      boolAttr('thisFight'),
      boolAttr('clearOnJump'),
      {name: 'loops'},
      {name: 'time'}
    ],
    tags: triggerChildren.map((t) => t.name), // todo define children
    description: `Creates a triggered event for the event based on attribute event. If name attribute is not specified, then name is EVENT_ID. If thisFight is true, trigger is cancelled once the fight is over. If clearOnJump is true, trigger is cancelled upon jumping.`
  },
  {
    name: 'clearTriggeredEvent',
    attributes: [{name: 'name', description: `name of trigger to clear, trigger must have a name`}]
  },
  {
    name: 'triggeredEventModifier',
    attributes: [
      {name: 'name'},
      {name: 'time'},
      {name: 'jumps'}
    ],
    description: `Modifies the time or jumps remaining for a trigger using the name attribute.`
  },
  {
    name: 'hiddenAug',
    attributes: [],
    contentsValueSet: AugmentNames.name,
    description: `Gives the player a hidden augment named based on the contents of the tag. Can be repeated.`
  },
  {
    name: 'removeHazards',
    attributes: [],
    description: `Removes all hazards (asteroids, pulsar, ASB, sun, and plasma storm). Nebula status is preserved.`
  },
  {name: 'removeNebula', attributes: [], description: `Removes nebula and plasma storm.`},
  {
    name: 'secretSectorWarp',
    attributes: [],
    description: `Specifies the name of the secret sector to send the player to (instead of the default crystal sector).`
  },
  {
    name: 'checkCargo',
    attributes: [],
    description: `Choice requirements will check the ship's cargo in addition to equipment. Can put value of true or false, no value means true.`
  },
  {
    name: 'transformRace',
    attributes: [{name: 'class', valueSet: CrewNames.name}],
    contentsValueSet: CrewNames.name,
    description: `Transforms a random crewmember to the race new_race. If the class attribute is specified, restricts the random crew selection.`
  },
  {name: 'removeStore', attributes: [], description: `Removes the store at the current beacon.`},
  {
    name: 'changeBackground',
    attributes: [],
    contentsValueSet: ImageListNames.name,
    description: `Changes the event background to the specified background.`
  },
  {
    name: 'clearBackgroundObject',
    attributes: [{name: 'name'}],
    description: `Clears all objects of a given definition name. If no name specified, clears everything. Repeatable.`
  },
  {name: 'playSound', attributes: [], contentsValueSet: SoundWaveNames.name, description: `Plays a sound.`},
  {
    name: 'enemyDamage', attributes: [
      {name: 'amount'},
      {name: 'system', valueSet: SystemNames.name},
      {name: 'effect'},
      boolAttr('force'),
      boolAttr('damageHull'),
    ],
    description: `Same syntax as vanilla's <damage> but afflicts the enemy ship. If force="true" then bypasses all system damage resistances. If damageHull="false" then do not inflict hull damage.`
  },
  {
    name: 'lose',
    attributes: [{name: 'text'}],
    description: `Immediately ends the run as a defeat. The game over text shall be specified.`
  },
  {name: 'system', attributes: [{name: 'name', valueSet: SystemNames.name}]},
  {
    name: 'noQuestText',
    attributes: [],
    description: `The "added a quest marker" text will not be displayed, to allow for silent quest spawning.`
  },
  {
    name: 'replaceSector',
    attributes: [{name: 'name'}],
    description: `Replaces one instance of TARGET_SECTOR with REPL_SECTOR (either a specific sector or a list: CIVILIAN/HOSTILE/NEBULA/UNKNOWN). If REPL_SECTOR is "RANDOM" or omitted then replace with a random of like color. If REPL_SECTOR is "ALL" replace with any random.`
  },
  {
    name: 'goToFlagship',
    attributes: [boolAttr('atBase'), boolAttr('allFleets')],
    description: `Warps the player to the Flagship if they are in the last stand. If atBase is true, the flagship will be advanced to the base. If allFleet is true, then all beacons in the sector will become controlled by the Rebel fleet.`
  },
  {
    name: 'superDrones',
    attributes: [boolAttr('player'), {name: 'name'}],
    description: `Triggers drone surge. For custom surge different from flagship add another <surgeDrones> tag in <boss> and give it a name.`
  },
  {
    name: 'clearSuperDrones',
    attributes: [boolAttr('player')],
    description: `Clears any existing surge drones, allowing a new surge to be generated.`
  },
  {
    name: 'superBarrage',
    attributes: [boolAttr('player'), {name: 'name'}],
    description: `Triggers barrage surge (phase 3 laser surge). For custom surge different from flagship add another <surgeBarrage> tag in <boss> and give it a name.`
  },
  {
    name: 'superShields',
    attributes: [boolAttr('player'), {name: 'amount'}, {name: 'add'}],
    description: `Regenerates supershield to given amount (full if not given), then adds the given additional amount (if not full).`
  },
  {
    name: 'removeItem',
    attributes: [],
    contentsValueSet: AllBlueprintsValueSet.name,
    description: `Removes the item with the specified name. Unlike vanilla's <remove> tag, this can be repeated, but it also does not display a "removed" message. Hidden augments can be removed by giving the name "HIDDEN AUG_ID", replacing AUG_ID with the normal augment's id.`
  },
  {
    name: 'loadEventList',
    attributes: [
      {name: 'name'},
      boolAttr('seeded'),
      boolAttr('first'),
      {
        name: 'default',
        valueSet: EventNamesValueSet.name
      }
    ],
    description: `Events that loadEvent the name of this list will load a random event from this list. seeded = "false" overrides loadEvent seeded. If first = "true", then load the first candidate instead of a random one. If default is specified, then load it if there are no valid candidates. Both the req and the event's resource requirements must be met (unless that event specifies steal="true"). max_group works differently here than vanilla; it will always keep the first event whose req is satisfied and discard the rest. If generate="true" and this is a root-level event, then the event is selected upon sector generation rather than on visit. You can also create an event directly inside this tag rather than naming an event.`
  },
  {
    name: 'revisitEvent',
    attributes: [
      boolAttr('seeded'),
      boolAttr('first')
    ],
    contentsValueSet: EventNamesValueSet.name,
    description: `Automatically loads this event by default when revisiting this beacon. Does not affect dive beacons.`
  },
  {
    name: 'eventAlias',
    attributes: [
      {name: 'name', valueSet: EventNamesValueSet.name},
      boolAttr('jumpClear'),
      boolAttr('once')
    ],
    contentsValueSet: EventNamesValueSet.name,
    description: `Sets an alias. Any loadEvent or loadEventList action on name="ALIAS_NAME" will load EVENT_NAME instead. Omit EVENT_NAME to clear. Does not affect vanilla event loading. Set jumpClear to true to auto-clear on jump; set once to auto-clear on use.`
  },
  {
    name: 'queueEvent',
    attributes: [boolAttr('seeded')],
    contentsValueSet: EventNamesValueSet.name,
    description: `Queues an event to happen as soon as the current event ends. Can queue multiple events.`
  },
  {
    name: 'runFromFleet',
    attributes: [boolAttr('closest')],
    description: `If the fleet/boss overtakes this beacon, move it to a random beacon. If closest is true, prefer a nearby beacon.`
  },
  {
    name: 'preventBossFleet',
    attributes: [boolAttr('forever')],
    description: `Prevents this event from being randomly overtaken by the fleet in the last stand. If forever is false, it will be overtaken last.`
  },
  {
    name: 'resetFtl',
    attributes: [],
    description: `Resets the player's FTL charge to zero.`
  },
  {
    name: 'win',
    attributes: [
      {name: 'creditsText', valueSet: TextIdNames.name},
      {name: 'text'},
      {
        name: 'creditsBackground',
        valueSet: ImageListNames.name
      },
      {name: 'sound'},
      {name: 'ach'}
    ],
    description: `Immediately ends the run as a victory. The victory text, credits text, and credits background may be specified. Specifying an achievement grants the corresponding achievement from <victories>.`
  },
  {
    name: 'disableScrapScore',
    attributes: [],
    description: `Any scrap gained from this event is not added to the player's score.`
  },
  {
    name: 'disableScrapAugments',
    attributes: [],
    description: `Any scrap gained from this event is not affected by augments (scrap recovery or repair arm).`
  },
  {
    name: 'deathEvent',
    attributes: [boolAttr('jumpClear'), boolAttr('thisFight')],
    contentsValueSet: EventNamesValueSet.name,
    description: `Loads an event when you die. Leave EVENT_NAME blank to clear any existing deathEvent.`
  }
];
const eventChildTags: XmlTag[] = [
  // ...allow XML tags of these types to be nested inside:
  {name: 'environment', attributes: []},
  {name: 'fleet', attributes: []},
  {name: 'distressBeacon', attributes: []},
  {name: 'repair', attributes: []},
  {
    name: 'autoReward',
    attributes: [
      {
        name: 'level',
        valueSet: AutoRewardLevelsValueSet.name
      }
    ],
    contentsValueSet: AutoRewardsValueSet.name
  },
  {
    name: 'crewMember',
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
  {
    name: 'boarders',
    attributes: [{name: 'class'}, {name: 'min'}, {name: 'max'}]
  },
  {name: 'reveal_map', attributes: []},
  {name: 'modifyPursuit', attributes: []},
  {
    name: 'quest',
    attributes: [{name: 'event', valueSet: EventNamesValueSet.name}],
    tags: questChildren.map((t) => t.name),
    description: `Same syntax as the default custom quest. Event-specific parameters override the defaults. If event attribute is specified, then it is applied to that event. Otherwise, it is applied to this event (CUSTOM_EVENT). In events.xml files it should only be used with the event attribute.`
  },
  {
    name: 'unlockShip',
    attributes: [boolAttr('silent'), {name: 'shipReq', valueSet: ShipBlueprintNames.name}],
    description: `Unlocks the ship PLAYER_SHIP_ID. If silent is true, the unlock is silent. If shipReq is specified, the unlock only occurs if the player is currently playing as that ship. Use alias unlockCustomShip in events.xml files.`
  },
  {name: 'item_modify', attributes: [], tags: ['item']},
  {
    name: 'secretSector',
    attributes: [],
    description: `Alias for secretSectorWarp. Allows specifying a custom secret sector in events.xml files with a single tag.`,
    contentsValueSet: SectorsValueSet.name
  },
  {name: 'upgrade', attributes: [{name: 'system', valueSet: SystemNames.name}]},
  {
    name: 'removeCrew',
    attributes: [{
      name: 'class',
      valueSet: CrewNames.name
    }],
    tags: ['text', 'clone']
  },
  {name: 'status', attributes: [{name: 'system', valueSet: SystemNames.name}]},
  {
    name: 'augment',
    attributes: [{name: 'name', valueSet: AugmentNames.name}]
  },
  {name: 'store', attributes: [], contentsValueSet: StoresValueSet.name},
  ...hyperspaceEventChildren
];

export const eventChildTagNames = eventChildTags.map((t) => t.name);
eventChildTagNames.push('choice',
    'text',
    'ship',
    'event',
    'weapon',
    'damage',
    'img',
    'drone');

export const eventTags: XmlTag[] = [
  {
    name: 'event',
    tags: eventChildTagNames,
    requiredTags: [],
    attributes: [
      {name: 'name'},
      boolAttr('hidden'),
      boolAttr('unique'),
      boolAttr('unused', 'prevent warnings by vscode if this event is not used anywhere, not used by FTL'),
      {name: 'load', valueSet: EventNamesValueSet.name},
      {
        name: 'recursive',
        valueSet: 'bool',
        description: `If recursive is true (default), then the same tags apply to all unnamed child events. Otherwise, it only applies to the top-level event.`
      }
    ],
    configOverride: {
      '>choice': {requiredTags: ['text']},
    }
  },
  {
    name: 'eventList',
    attributes: [
      boolAttr('unused', 'prevent warnings by vscode if this event is not used anywhere, not used by FTL'),
    ],
    tags: ['event']
  },
  {
    name: 'loadEvent',
    attributes: [boolAttr('seeded'), boolAttr('ignoreUnique')],
    contentsValueSet: EventNamesValueSet.name,
    description: `Loads event specificed in the tag contents on the fly (rather than preloading like in vanilla). If seeded is true, event is seeded by sector/beacon.`
  },
  {
    name: 'choice',
    description: 'encloses the choice text and event for each choice in an event',
    tags: ['event', 'text'],
    requiredTags: ['text'],
    attributes: [
      boolAttr('unique'),
      {
        name: 'hidden',
        valueSet: 'bool',
        description: ` if marked true, the choice's rewards will not be displayed before selecting the event. By default set to false. (usually set to true unless its an event where a trade is made, so that you can see the exact values of what is being traded)`
      },
      {name: 'req', valueSet: ReqNames.name},
      {name: 'lvl'},
      boolAttr('blue'),
      {name: 'max_group'},
      {name: 'max_lvl'}
    ]
  },
  ...eventChildTags,
  ...questChildren,
  ...triggerChildren
];
