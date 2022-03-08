import {boolAttr, XmlTag} from './helpers';
import {eventTags} from './event-elements';
import {
  AugmentNames,
  DroneNames,
  ImageListNames,
  MusicPaths,
  SoundWaveNames,
  SystemNames,
  TextIdNames,
  VariableNames
} from '../autocomplete-value-sets';
import {shipTags} from './ship-elements';
import {blueprintTags} from './blueprint-elements';
import {weaponTags} from './weapon-elements';
import {animationTags} from './animation-elements';
import {sectorTags} from './sector-elements';
import {raceTags} from './race-elements';

export const allTags: XmlTag[] = [
  ...eventTags,
  ...shipTags,
  ...blueprintTags,
  ...weaponTags,
  ...animationTags,
  ...sectorTags,
  ...raceTags,
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

  {
    // child of weapon blueprint and anim
    name: 'desc', attributes: [
      // weapon attributes
      {name: 'id', valueSet: TextIdNames.name},
      // animation attributes
      {name: 'length'}, {name: 'x'}, {name: 'y'}
    ]
  },

  // aug is used in hyperspace.xml and for ship blueprints
  {name: 'aug', attributes: [{name: 'name', valueSet: AugmentNames.name}], tags: ['function']},

  //  weird one, not sure if this is correct currently but everything seems to indicate that the function
  //  name should be treated as an aug blueprint also
  {
    name: 'function',
    attributes: [
      {name: 'name', valueSet: AugmentNames.name},
      {name: 'value'},
      boolAttr('useForReqs'),
      boolAttr('warning')
    ]
  },

  // time sounds for events in hyperspace? not event specific
  {name: 'timerSound', attributes: [], contentsValueSet: SoundWaveNames.name},

  // music tags
  {name: 'explore', attributes: [], contentsValueSet: MusicPaths.name},
  {name: 'combat', attributes: [], contentsValueSet: MusicPaths.name},

  {name: 'variable', attributes: [{name: 'name', valueSet: VariableNames.name}, {name: 'val'}, {name: 'op'}]},
  {name: 'metaVariable', attributes: [{name: 'name', valueSet: VariableNames.name}, {name: 'val'}, {name: 'op'}]},
  {name: 'req', attributes: [{name: 'name'}, {name: 'type', values: [{name: 'any'}, {name: 'all'}, {name: 'sum'}]}]}
];
