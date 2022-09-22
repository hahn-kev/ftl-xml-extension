import {XmlTag} from './helpers';
import {BlueprintListTypeAny} from '../ftl-data';
import {TextIdNames} from '../autocomplete-value-sets';
import {shipBlueprintTags} from './ship-blueprint-elements';

// drone and weapon blueprints are in weapon-elements.ts
export const blueprintTags: XmlTag[] = [
  ...shipBlueprintTags,
  {
    name: 'blueprintList',
    tags: ['name'],
    attributes: [
      {name: 'name'},
      {name: 'type', values: [{name: BlueprintListTypeAny}]}
    ]
  },
  {
    name: 'crewBlueprint',
    attributes: [{name: 'name'}],
    tags: [
      'desc', 'cost', 'title', 'short', 'rarity', 'powerList', 'bp', 'colorList'
    ]
  },
  {
    name: 'systemBlueprint',
    attributes: [{name: 'name'}],
    tags: [
      'type', 'title', 'desc', 'startPower', 'maxPower', 'rarity', 'upgradeCost',
      'cost', 'locked', 'bp'
    ]
  },
  {
    // used on most blueprints
    name: 'title',
    attributes: [{name: 'id', valueSet: TextIdNames.name}],
  },
  {name: 'augBlueprint', attributes: [{name: 'name'}]},
];
