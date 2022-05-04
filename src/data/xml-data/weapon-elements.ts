import {boolAttr, XmlTag} from './helpers';
import {
  AnimationNames,
  SoundWaveNames,
  TextIdNames,
  WeaponAnimationNames,
  WeaponNames
} from '../autocomplete-value-sets';

const weaponChildTags: XmlTag[] = [
  {name: 'type', attributes: []},
  {name: 'short', attributes: [{name: 'id', valueSet: TextIdNames.name}]},
  {name: 'locked', attributes: []},
  {name: 'tooltip', attributes: [{name: 'id', valueSet: TextIdNames.name}]},
  {name: 'ion', attributes: []},
  {name: 'sysDamage', attributes: []},
  {name: 'persDamage', attributes: []},
  {name: 'speed', attributes: []},
  {name: 'missiles', attributes: []},
  {name: 'shots', attributes: []},
  {name: 'length', attributes: []},
  {name: 'lockdown', attributes: []},
  {name: 'sp', attributes: []},
  {name: 'fireChance', attributes: []},
  {name: 'breachChance', attributes: []},
  {name: 'stunChance', attributes: []},
  {name: 'hullBust', attributes: []},
  {name: 'cooldown', attributes: []},
  {name: 'power', attributes: []},
  {name: 'cost', attributes: []},
  {name: 'bp', attributes: []},
  {name: 'rarity', attributes: [], contentsValueSet: 'rarity-value-set'},
  {name: 'image', attributes: [], contentsValueSet: AnimationNames.name},
  {name: 'explosion', attributes: [], contentsValueSet: AnimationNames.name},
  {name: 'launchSounds', attributes: []},
  {name: 'hitShipSounds', attributes: []},
  {name: 'hitShieldSounds', attributes: []},
  {name: 'missSounds', attributes: []},
  {name: 'weaponArt', attributes: [], contentsValueSet: WeaponAnimationNames.name},
  {name: 'tip', attributes: [], contentsValueSet: TextIdNames.name},
  {name: 'iconImage', attributes: []},
  {name: 'color', attributes: []},
  {name: 'drone_targetable', attributes: []},
  {name: 'flavorType', attributes: [{name: 'id', valueSet: TextIdNames.name}]},
  {name: 'radius', attributes: []},
  {name: 'spin', attributes: []},
  {name: 'projectiles', tags: ['projectile'], attributes: []},
  {name: 'chargeLevels', attributes: []},
  {name: 'boost', attributes: []},
  {name: 'stun', attributes: []},
];
const weaponTagNames = [...weaponChildTags.map((t) => t.name), 'title'];
export const weaponTags: XmlTag[] = [
  ...weaponChildTags,
  {
    name: 'weaponBlueprint',
    tags: weaponTagNames,
    requiredTags: [
      'type', 'title', 'short', 'desc', 'tooltip', 'cooldown',
      'power', 'cost', 'rarity', 'weaponArt', 'launchSounds',
    ],
    configOverride: {'droneBlueprint<': {requiredTags: []}},
    attributes: [{name: 'name'}]
  },
  {
    name: 'droneBlueprint',
    attributes: [{name: 'name'}],
    tags: ['weaponBlueprint']
  },
  {
    // can be used as child of event or weaponList on blueprint
    name: 'weapon',
    attributes: [{name: 'name', valueSet: WeaponNames.name}]
  },
  {
    name: 'projectile',
    attributes: [{name: 'count'}, boolAttr('fake')],
    contentsValueSet: AnimationNames.name
  },
  // child of various lists
  {name: 'sound', attributes: [], contentsValueSet: SoundWaveNames.name},
];
