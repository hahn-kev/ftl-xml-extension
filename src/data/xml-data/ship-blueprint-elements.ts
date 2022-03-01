import {XmlTag} from './helpers';
import {AutoblueprintNames, CrewNames, TextIdNames} from '../autocomplete-value-sets';

const shipBlueprintChildren: XmlTag[] = [
  {
    name: 'unlock',
    attributes: [{name: 'id', valueSet: TextIdNames.name}]
  },
  {
    name: 'crewCount',
    attributes: [{name: 'amount'}, {name: 'max'}, {name: 'class', valueSet: CrewNames.name}]
  },
  {
    name: 'shieldImage',
    attributes: []
  },
  {
    name: 'cloakImage',
    attributes: []
  }
];

export const shipBlueprintTags: XmlTag[] = [
  {
    name: 'shipBlueprint',
    attributes: [{name: 'name'}],
    tags: shipBlueprintChildren.map((s) => s.name)
  },
  ...shipBlueprintChildren,
  {name: 'bossShip', attributes: [], contentsValueSet: AutoblueprintNames.name},
];
