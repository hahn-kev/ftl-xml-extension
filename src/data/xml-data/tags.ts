import {XmlTag} from './helpers';
import {eventTags} from './event-elements';
import {DroneNames, ImageListNames, MusicPaths, SystemNames, TextIdNames} from '../autocomplete-value-sets';
import {shipTags} from './ship-elements';
import {blueprintTags} from './blueprint-elements';
import {weaponTags} from './weapon-elements';
import {animationTags} from './animation-elements';
import {sectorTags} from './sector-elements';

export const allTags: XmlTag[] = [
  ...eventTags,
  ...shipTags,
  ...blueprintTags,
  ...weaponTags,
  ...animationTags,
  ...sectorTags,
  {
    name: 'text',
    attributes: [
      {name: 'name'},
      {name: 'id', valueSet: TextIdNames.name},
      {name: 'load', valueSet: TextIdNames.name}
    ]
  },
  {
    name: 'textList',
    attributes: [{name: 'name'}],
    tags: ['text']
  },

  {
    // child of event, and weapon blueprint
    name: 'damage',
    attributes: [
      {name: 'amount'},
      {name: 'system', valueSet: SystemNames.name},
      {name: 'effect'}
    ]
  },
  {
    // child of event and imageList
    name: 'img', attributes: [
      {name: 'planet', valueSet: ImageListNames.name},
      {name: 'back', valueSet: ImageListNames.name}
    ]
  },
  {name: 'imageList', attributes: [{name: 'name'}], tags: ['img']},

  {
    // child of event and ship blueprint drone list
    name: 'drone',
    attributes: [{name: 'name', valueSet: DroneNames.name}]
  },

  // music tags
  {name: 'explore', attributes: [], contentsValueSet: MusicPaths.name},
  {name: 'combat', attributes: [], contentsValueSet: MusicPaths.name},
];
