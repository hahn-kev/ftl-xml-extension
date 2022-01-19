import {
  AnimationNames,
  AnimationSheetNames,
  AugmentNames,
  AutoblueprintNames,
  CrewNames,
  DroneNames,
  EventNamesValueSet,
  ImageListNames,
  ImgPathNames,
  MusicPaths,
  ShipNames,
  SoundWaveNames,
  SoundWavePaths,
  SystemNames,
  TextIdNames,
  WeaponAnimationNames,
  WeaponNames
} from './autocomplete-value-sets';
import {XmlData} from './xml-data/helpers';
import {allTags} from './xml-data/tags';

export const BlueprintListTypeAny = 'any';
export const FtlData: XmlData = {
  version: 1.1,
  tags: allTags,
  valueSets: [
    {name: 'bool', values: [{name: 'true'}, {name: 'false'}]},
    {
      name: 'rarity-value-set',
      values: [
        {name: '1', description: 'most frequent'},
        {name: '2'},
        {name: '3'},
        {name: '4'},
        {name: '5', description: 'least frequent'},
        {name: '0', description: 'never shows up'},
      ]
    },
    {
      name: 'auto-reward-set', values: [
        {name: 'stuff'},
        {name: 'standard'},
        {name: 'scrap_only'},
        {name: 'weapon'},
        {name: 'droneparts'},
        {name: 'missiles'},
      ]
    },
    EventNamesValueSet,
    ShipNames,
    AutoblueprintNames,
    TextIdNames,
    WeaponNames,
    DroneNames,
    AugmentNames,
    CrewNames,
    SystemNames,
    SoundWaveNames,
    SoundWavePaths,
    MusicPaths,
    AnimationNames,
    AnimationSheetNames,
    WeaponAnimationNames,
    ImgPathNames,
    ImageListNames
  ]
};
