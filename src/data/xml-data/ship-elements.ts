import {boolAttr, XmlTag} from './helpers';
import {eventChildTagNames} from './event-elements';
import {ShipBlueprintNames, EventNamesValueSet, ShipNames} from '../autocomplete-value-sets';

export const shipChildTags: XmlTag[] = [
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
    name: 'surrender',
    tags: eventChildTagNames,
    attributes: [{name: 'load', valueSet: EventNamesValueSet.name}]
  },
  {
    name: 'escape',
    tags: eventChildTagNames,
    attributes: [{name: 'load', valueSet: EventNamesValueSet.name}]
  },
  {
    name: 'gotaway',
    tags: eventChildTagNames,
    attributes: [{name: 'load', valueSet: EventNamesValueSet.name}]
  },
  {name: 'crew', attributes: [], tags: ['crewMember']},
];
export const shipTagNames = [...shipChildTags.map((t) => t.name), 'crewMember'];

export const shipTags: XmlTag[] = [
  {
    name: 'ship',
    tags: shipTagNames,
    attributes: [
      {
        name: 'load',
        valueSet: ShipNames.name
      },
      {
        name: 'auto_blueprint',
        valueSet: ShipBlueprintNames.name
      },
      {name: 'name'},
      boolAttr('unused', 'prevent warnings by vscode if this event is not used anywhere, not used by FTL'),
      boolAttr('hostile'),
      boolAttr('b'),
      boolAttr('c'),
    ]
  },
  {name: 'shipIcons', attributes: []},
  {name: 'shipIcon', attributes: []},
  ...shipChildTags
];
