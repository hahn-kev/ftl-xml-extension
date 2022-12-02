import {XmlTag} from './helpers';
import {AnimationSheetNames, ImgPathNames} from '../autocomplete-value-sets';

export const animationTags: XmlTag[] = [
  {name: 'anim', attributes: [{name: 'name'}]},
  {name: 'weaponAnim', attributes: [{name: 'name'}]},
  {name: 'sheet', attributes: [], contentsValueSet: AnimationSheetNames.name},
  {name: 'time', attributes: []},
  {
    name: 'animSheet',
    attributes: [
      {name: 'name'},
      {name: 'w'},
      {name: 'h'},
      {name: 'fw'},
      {name: 'fh'},
    ],
    contentsValueSet: ImgPathNames.name,
    configOverride: {
      'race<': {contentsValueSet: AnimationSheetNames.name}
    }
  },
  {name: 'chargeImage', attributes: [], contentsValueSet: ImgPathNames.name},
];
