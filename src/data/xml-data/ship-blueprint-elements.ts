import {boolAttr, XmlTag} from './helpers';
import {ShipBlueprintNames, CrewNames, TextIdNames, WeaponNames} from '../autocomplete-value-sets';
import {IAttributeData} from 'vscode-html-languageservice';
const defaultSystemAttributes: IAttributeData[] = [
  {name: 'max'},
  {name: 'power'},
  {name: 'room'},
  boolAttr('start')
];
const systemsListChildren: XmlTag[] = [
  {
    name: 'artillery',
    attributes: [
      ...defaultSystemAttributes,
      {name: 'weapon', valueSet: WeaponNames.name}
    ]
  },
  {
    name: 'battery',
    attributes: [
      ...defaultSystemAttributes,
    ]
  },
  {
    name: 'cloaking',
    attributes: [
      ...defaultSystemAttributes,
    ]
  },
  {
    name: 'clonebay',
    attributes: [
      ...defaultSystemAttributes,
    ]
  },
  {
    name: 'doors',
    attributes: [
      ...defaultSystemAttributes,
    ]
  },
  {
    name: 'drones',
    attributes: [
      ...defaultSystemAttributes,
    ]
  },
  {
    name: 'engines',
    attributes: [
      ...defaultSystemAttributes,
    ]
  },
  {
    name: 'hacking',
    attributes: [
      ...defaultSystemAttributes,
    ]
  },
  {
    name: 'medbay',
    attributes: [
      ...defaultSystemAttributes,
    ]
  },
  {
    name: 'mind',
    attributes: [
      ...defaultSystemAttributes,
    ]
  },
  {
    name: 'oxygen',
    attributes: [
      ...defaultSystemAttributes,
    ]
  },
  {
    name: 'pilot',
    attributes: [
      ...defaultSystemAttributes,
    ]
  },
  {
    name: 'sensors',
    attributes: [
      ...defaultSystemAttributes,
    ]
  },
  {
    name: 'shields',
    attributes: [
      ...defaultSystemAttributes,
    ]
  },
  {
    name: 'teleporter',
    attributes: [
      ...defaultSystemAttributes,
    ]
  },
  {
    name: 'weapons',
    attributes: [
      ...defaultSystemAttributes,
    ]
  },
  {
    name: 'temporal',
    attributes: [
      ...defaultSystemAttributes,
    ]
  },

];
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
  },
  {
    name: 'systemList',
    tags: systemsListChildren.map(s => s.name),
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
  ...systemsListChildren,
  // custom hyperspace tags
  {name: 'bossShip', attributes: [], contentsValueSet: ShipBlueprintNames.name},
  {name: 'customShip', attributes: [{name: 'name', valueSet: ShipBlueprintNames.name}]},
  {name: 'shipReq', attributes: [], contentsValueSet: ShipBlueprintNames.name},
  {name: 'victory', attributes: [], contentsValueSet: ShipBlueprintNames.name},
];
