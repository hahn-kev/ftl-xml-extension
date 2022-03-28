import {boolAttr, XmlTag} from './helpers';
import {eventChildTagNames} from './event-elements';
import {AutoblueprintNames, EventNamesValueSet, ShipNames} from '../autocomplete-value-sets';

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
        valueSet: AutoblueprintNames.name
      },
      {name: 'name'},
      boolAttr('hostile'),
      boolAttr('b'),
      boolAttr('c'),
    ]
  },
  {name: 'shipIcons', attributes: []},
  {name: 'shipIcon', attributes: []},
  ...shipChildTags
];
