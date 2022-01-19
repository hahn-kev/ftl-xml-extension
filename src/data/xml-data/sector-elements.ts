import {boolAttr, XmlTag} from './helpers';
import {EventNamesValueSet} from '../autocomplete-value-sets';

const sectorDescriptionTags: XmlTag[] = [
  {name: 'startEvent', attributes: [], contentsValueSet: EventNamesValueSet.name},
  {name: 'rarityList', attributes: []},
  {name: 'trackList', attributes: []},
  {name: 'nameList', attributes: []},
  {
    // hyperspace tag
    name: 'removeFirstBeaconNebula',
    attributes: []
  }
];
const hyperspaceSectorTags: XmlTag[] = [
  {
    // hyperspace tag
    name: 'exitBeacon',
    attributes: [
      {name: 'event', valueSet: EventNamesValueSet.name},
      {name: 'nebulaEvent', valueSet: EventNamesValueSet.name},
      {name: 'rebelEvent', valueSet: EventNamesValueSet.name}
    ]
  },
  {
    // hyperspace tag
    name: 'rebelBeacon',
    attributes: [
      {name: 'event', valueSet: EventNamesValueSet.name},
      {name: 'nebulaEvent', valueSet: EventNamesValueSet.name}
    ]
  },
];
export const sectorTags: XmlTag[] = [
  ...sectorDescriptionTags,
  {
    name: 'sectorDescription',
    attributes: [
      {name: 'name'},
      {name: 'minSector'},
      boolAttr('unique'),
    ],
    tags: sectorDescriptionTags.map((t) => t.name)
  },
  {
    name: 'sector',
    attributes: [{name: 'name'}],
    tags: hyperspaceSectorTags.map((t) => t.name)
  },
  ...sectorDescriptionTags,
  ...hyperspaceSectorTags
];
