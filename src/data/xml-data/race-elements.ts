import {XmlTag} from './helpers';
import {SoundWaveNames} from '../autocomplete-value-sets';

export const raceTags: XmlTag[] = [
  {name: 'powerSound', attributes: [], contentsValueSet: SoundWaveNames.name},
  {name: 'deathSound', attributes: [], contentsValueSet: SoundWaveNames.name},
  {name: 'finishSound', attributes: [], contentsValueSet: SoundWaveNames.name},
  {name: 'shootingSound', attributes: [], contentsValueSet: SoundWaveNames.name},
  {name: 'repairSound', attributes: [], contentsValueSet: SoundWaveNames.name},
];
