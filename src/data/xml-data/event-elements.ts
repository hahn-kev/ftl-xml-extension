import {
  AugmentNames,
  CrewNames,
  EventNamesValueSet,
  SoundWaveNames,
  SystemNames,
  TextIdNames
} from '../autocomplete-value-sets';
import {boolAttr, XmlTag} from './helpers';

const questChildren: XmlTag[] = [
  {name: 'nebulaEvent', attributes: [], contentsValueSet: EventNamesValueSet.name},
  {name: 'nebulaBeacon', attributes: [], contentsValueSet: 'bool'},
  {name: 'createNebula', attributes: [], contentsValueSet: 'bool'},
  {name: 'nextSector', attributes: [], contentsValueSet: 'bool'},
  {name: 'aggressive', attributes: []},
];

const hyperspaceEventChildren: XmlTag[] = [
  {name: 'beaconType', attributes: []},
  {name: 'recallBoarders', attributes: []},
  {name: 'instantEscape', attributes: []},
  {name: 'customFleet', attributes: []},
  {name: 'unlockCustomShip', attributes: []},
  {name: 'preventQuest', attributes: []},
  {name: 'preventFleet', attributes: []},
  {name: 'remove', attributes: [{name: 'name'}]},
  {name: 'jumpEvent', attributes: [], contentsValueSet: EventNamesValueSet.name},
  {name: 'restartEvent', attributes: []},
  {
    name: 'triggeredEvent',
    attributes: [
      {name: 'name'},
      {name: 'event', valueSet: EventNamesValueSet.name},
      boolAttr('thisFight'),
      boolAttr('clearOnJump'),
      {name: 'time'}
    ],
    tags: []// todo define children
  },
  {
    name: 'clearTriggeredEvent',
    attributes: [{name: 'name', description: `name of trigger to clear, trigger must have a name`}]
  },
  {name: 'hiddenAug', attributes: [], contentsValueSet: AugmentNames.name},
  {name: 'removeHazards', attributes: []},
  {name: 'secretSectorWarp', attributes: []},
  {
    name: 'checkCargo',
    attributes: [],
    description: `Choice requirements will check the ship's cargo in addition to equipment. Can put value of true or false, no value means true.`
  },
  {name: 'transformRace', attributes: []},
  {name: 'changeBackground', attributes: []},
  {name: 'playSound', attributes: [], contentsValueSet: SoundWaveNames.name},
  {
    name: 'enemyDamage', attributes: [
      {name: 'amount'},
      {name: 'system', valueSet: SystemNames.name},
      {name: 'effect'}
    ]
  },
  {name: 'lose', attributes: [{name: 'text'}], description: `lose the game`},
  {name: 'system', attributes: [{name: 'name', valueSet: SystemNames.name}]},
  {name: 'noQuestText', attributes: []},
  {name: 'replaceSector', attributes: [{name: 'name'}]},
  {name: 'superBarrage', attributes: [boolAttr('player'), {name: 'name'}]},
  {name: 'superDrones', attributes: [boolAttr('player'), {name: 'name'}]},
  {name: 'clearSuperDrones', attributes: [boolAttr('player')]},
  {name: 'removeItem', attributes: [], contentsValueSet: AugmentNames.name},
  {name: 'loadEventList', attributes: []},
  {name: 'superShields', attributes: []},
  {name: 'runFromFleet', attributes: [boolAttr('closest')]},
  {name: 'preventBossFleet', attributes: [boolAttr('forever')]},
  {
    name: 'resetFtl',
    attributes: [],
    description: `prevents jumping from an event, for example in combat, or from a <jumpEvent> trigger`
  },
  {name: 'win', attributes: [{name: 'creditsText', valueSet: TextIdNames.name}, {name: 'text'}]},
  {name: 'disableScrapScore', attributes: []},
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
        values: [{name: 'LOW'}, {name: 'MED'}, {name: 'HIGH'}]
      }
    ],
    contentsValueSet: 'auto-reward-set'
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
    tags: questChildren.map((t) => t.name)
  },
  {name: 'unlockShip', attributes: []},
  {name: 'item_modify', attributes: [], tags: ['item']},
  {name: 'secretSector', attributes: []},
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
  {name: 'store', attributes: []},
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

export const eventTags = [
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
  {name: 'eventList', attributes: [], tags: ['event']},
  {name: 'loadEvent', attributes: [], contentsValueSet: EventNamesValueSet.name},
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
      {name: 'req'},
      {name: 'lvl'},
      boolAttr('blue'),
      {name: 'max_group'},
      {name: 'max_lvl'}
    ]
  },
  ...eventChildTags,
  ...questChildren
];
