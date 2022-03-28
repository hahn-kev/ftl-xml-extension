import {XmlTag} from './helpers';
import {ShipBlueprintNames, CrewNames, TextIdNames, WeaponNames} from '../autocomplete-value-sets';

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
    name: 'weaponList',
    attributes: [{name: 'missiles'}, {name: 'count'}, {name: 'load', valueSet: WeaponNames.name}]
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
    tags: shipBlueprintChildren.map((s) => s.name).concat(['aug'])
  },
  ...shipBlueprintChildren,
  // custom hyperspace tags
  {name: 'bossShip', attributes: [], contentsValueSet: ShipBlueprintNames.name},
  {name: 'customShip', attributes: [{name: 'name', valueSet: ShipBlueprintNames.name}]},
  {name: 'shipReq', attributes: [], contentsValueSet: ShipBlueprintNames.name},
  {name: 'victory', attributes: [], contentsValueSet: ShipBlueprintNames.name},
];
