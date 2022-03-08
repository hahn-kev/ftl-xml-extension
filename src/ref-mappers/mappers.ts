import {RefMapper, RefMapperBase} from './ref-mapper';
import {FtlEvent} from '../models/ftl-event';
import {Node} from 'vscode-html-languageservice';
import {Position, TextDocument} from 'vscode';
import {events} from '../events';
import {getAttrValueForTag, getFileName, getNodeTextContent, hasAttr, normalizeAttributeName} from '../helpers';
import {
  AnimationNames,
  AnimationSheetNames,
  AugmentNames,
  AutoblueprintNames,
  CrewNames,
  DroneNames,
  EventNamesValueSet,
  ImageListNames,
  ShipNames,
  SoundWaveNames,
  SystemNames,
  TextIdNames,
  WeaponAnimationNames,
  WeaponNames
} from '../data/autocomplete-value-sets';
import {defaultEvents} from '../data/default-ftl-data/default-events';
import {FtlShip} from '../models/ftl-ship';
import {defaultShips} from '../data/default-ftl-data/default-ships';
import {FtlWeapon} from '../models/ftl-weapon';
import {FtlAutoblueprint} from '../models/ftl-autoblueprint';
import {defaultAutoBlueprints} from '../data/default-ftl-data/default-auto-blueprints';
import {FtlText} from '../models/ftl-text';
import {BlueprintMapper} from '../blueprints/blueprint-mapper';
import {defaultWeaponBlueprints} from '../data/default-ftl-data/default-weapon-blueprints';
import {FtlDrone} from '../models/ftl-drone';
import {defaultDrones} from '../data/default-ftl-data/default-drones';
import {FtlAugment} from '../models/ftlAugment';
import {defaultAugments} from '../data/default-ftl-data/default-augments';
import {FtlCrew} from '../models/ftl-crew';
import {defaultCrew} from '../data/default-ftl-data/default-crew';
import {FtlSystem} from '../models/ftl-system';
import {defaultSystems} from '../data/default-ftl-data/default-systems';
import {defaultText} from '../data/default-ftl-data/default-text';
import {RefParser} from './ref-parser';
import {FtlSound} from '../models/ftl-sound';
import {defaultSoundWaves} from '../data/default-ftl-data/default-sound-waves';
import {Sounds} from '../sounds';
import {FtlAnimation} from '../models/ftl-animation';
import {defaultAnimations} from '../data/default-ftl-data/default-animations';
import {FtlAnimationSheet} from '../models/ftl-animation-sheet';
import {defaultAnimationSheets} from '../data/default-ftl-data/default-animation-sheets';
import {FtlWeaponAnimation} from '../models/ftl-weapon-animation';
import {defaultWeaponAnimations} from '../data/default-ftl-data/default-weapon-animations';
import {defaultImageLists} from '../data/default-ftl-data/default-image-lists';
import {FtlImageList} from '../models/ftl-image-list';
import {declarationBasedMapFunction, NodeMapImp, staticValueNodeMap} from './node-map';

export class Mappers {
  readonly eventsMapper = new RefMapper(
      new RefParser((file) => file.event, FtlEvent, events),
      EventNamesValueSet,
      'Event',
      defaultEvents
  );


  readonly shipsMapper = new RefMapper(
      new RefParser(
          (file) => file.ship,
          FtlShip,
          new NodeMapImp(
              ({node, document, position}) => {
                return getAttrValueForTag(node, 'ship', 'name', document, position);
              },
              ({node, document, position}) => {
                return getNodeTextContent(node, document, 'ship', 'shipOrder')
                    ?? getAttrValueForTag(node, 'ship', 'load', document, position);
              })
      ),
      ShipNames,
      'Ship',
      defaultShips);

  readonly weaponsMapper = new RefMapper(
      new RefParser(
          (file) => file.weapon,
          FtlWeapon,
          new NodeMapImp(
              ({node, document, position}) => {
                return getAttrValueForTag(node, 'weaponBlueprint', 'name', document, position);
              },
              ({node, document, position}) => {
                const name = getAttrValueForTag(node, 'weapon', 'name', document, position)
                    ?? getAttrValueForTag(node, 'weaponList', 'load', document, position);
                if (name) return name;
                if (node.tag == 'weaponBlueprint' && node.parent?.tag == 'droneBlueprint' && !node.attributes) {
                  return getNodeTextContent(node, document);
                }
              }
          ),
      ),
      WeaponNames,
      'Weapon',
      defaultWeaponBlueprints);

  readonly dronesMapper = new RefMapper(
      new RefParser(
          (file) => file.drone,
          FtlDrone,
          staticValueNodeMap([{tag: 'droneBlueprint', attr: 'name'}], [{tag: 'drone', attr: 'name'}])
      ),
      DroneNames,
      'Drone',
      defaultDrones);

  readonly augmentsMapper = new RefMapper(
      new RefParser(
          (file) => file.augment,
          FtlAugment,
          new NodeMapImp((context) => getAttrValueForTag(context.node,
              'augBlueprint',
              'name',
              context.document,
              context.position),
          declarationBasedMapFunction(AugmentNames)),
      ),
      AugmentNames,
      'Augment',
      defaultAugments);

  readonly crewMapper = new RefMapper(
      new RefParser(
          (file) => file.crews,
          FtlCrew,
          staticValueNodeMap(
              [{tag: 'crewBlueprint', attr: 'name'}],
              [
                {tag: 'crewMember', attr: 'class'},
                {tag: 'crewMember', attr: 'type'},
                {tag: 'removeCrew', attr: 'class'},
                {tag: 'crewCount', attr: 'class'},
                {tag: 'transformRace', attr: 'class'},
                {tag: 'transformRace', type: 'contents'}
              ])
      ),
      CrewNames,
      'Crew',
      defaultCrew);

  readonly systemMapper = new RefMapper(
      new RefParser(
          (file) => file.system,
          FtlSystem,
          staticValueNodeMap(
              [{tag: 'systemBlueprint', attr: 'name'}],
              [
                {tag: 'status', attr: 'system'},
                {tag: 'upgrade', attr: 'system'},
                {tag: 'damage', attr: 'system'}
              ])
      ),
      SystemNames,
      'System',
      defaultSystems);


  readonly autoBlueprintMapper = new RefMapper(
      new RefParser(
          (file) => file.autoBlueprint,
          FtlAutoblueprint,
          {
            getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
              return getAttrValueForTag(node, 'shipBlueprint', 'name', document, position);
            },
            getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
              return getAttrValueForTag(node, 'ship', 'auto_blueprint', document, position)
                  ?? getNodeTextContent(node, document, 'bossShip');
            }
          }
      ),
      AutoblueprintNames,
      'Auto Blueprint',
      defaultAutoBlueprints);

  readonly textMapper = new RefMapper(
      new RefParser(
          (file) => file.text,
          FtlText,
          new NodeMapImp(
              ({node, document, position}) => {
                if (node.tag == 'text' && hasAttr(node, 'name', document, position)) {
                  // filter out language files
                  if (getFileName(document)?.startsWith('text-')) {
                    return undefined;
                  }
                  return normalizeAttributeName(node.attributes.name);
                }

                return getAttrValueForTag(node, 'textList', 'name', document, position);
              },
              declarationBasedMapFunction(TextIdNames)),
      ),
      TextIdNames,
      'Text',
      defaultText);

  readonly soundWaveMapper = new RefMapper(
      new RefParser((file) => file.sounds,
          FtlSound,
          new NodeMapImp(
              ({document, node, position}) => {
                return Sounds.isWaveNode(node, document) ? node.tag : undefined;
              },
              declarationBasedMapFunction(SoundWaveNames),
          )),
      SoundWaveNames,
      'Wave',
      defaultSoundWaves
  );

  readonly animationMapper = new RefMapper(
      new RefParser((file) => file.animations,
          FtlAnimation,
          {
            getNameDef: (node: Node, document: TextDocument, position?: Position): string | undefined => {
              return getAttrValueForTag(node, 'anim', 'name', document, position);
            },
            getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
              return getNodeTextContent(node, document, 'image')
                  ?? getNodeTextContent(node, document, 'explosion', 'weaponBlueprint');
            }
          }),
      AnimationNames,
      'Animation',
      defaultAnimations
  );

  readonly animationSheetMapper = new RefMapper(
      new RefParser((file) => file.animationSheets,
          FtlAnimationSheet,
          {
            getNameDef: (node: Node, document: TextDocument, position?: Position): string | undefined => {
              return getAttrValueForTag(node, 'animSheet', 'name', document, position);
            },
            getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
              return getNodeTextContent(node, document, 'sheet');
            }
          }),
      AnimationSheetNames,
      'Animation Sheet',
      defaultAnimationSheets
  );

  readonly weaponAnimationMapper = new RefMapper(
      new RefParser((file) => file.weaponAnimations,
          FtlWeaponAnimation,
          {
            getNameDef: (node: Node, document: TextDocument, position?: Position): string | undefined => {
              return getAttrValueForTag(node, 'weaponAnim', 'name', document, position);
            },
            getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
              return getNodeTextContent(node, document, 'weaponArt');
            }
          }),
      WeaponAnimationNames,
      'Weapon Animation',
      defaultWeaponAnimations,
      this.animationMapper
  );

  readonly imageListMapper = new RefMapper(
      new RefParser((file) => file.imageLists,
          FtlImageList,
          new NodeMapImp(
              ({node, document, position}) => {
                return getAttrValueForTag(node, 'imageList', 'name', document, position);
              },
              ({node, document, position}) => {
                if (node.tag === 'img' && node.parent?.tag === 'event') {
                  const refs: string[] = [];
                  if (hasAttr(node, 'back', document, position)) {
                    refs.push(normalizeAttributeName(node.attributes.back));
                  }
                  if (hasAttr(node, 'planet', document, position)) {
                    refs.push(normalizeAttributeName(node.attributes.planet));
                  }
                  if (position) return refs[0];
                  return refs;
                }
                return getNodeTextContent(node, document, 'changeBackground')
                    ?? getAttrValueForTag(node, 'win', 'creditsBackground', document, position);
              }),
      ),
      ImageListNames,
      'Image List',
      defaultImageLists
  );

  readonly blueprintMapper = new BlueprintMapper([
    this.weaponsMapper,
    this.autoBlueprintMapper,
    this.dronesMapper,
    this.augmentsMapper,
    this.crewMapper,
    this.systemMapper
  ]);

  readonly list: RefMapperBase[] = [
    this.eventsMapper,
    this.shipsMapper,
    this.textMapper,
    this.soundWaveMapper,
    this.animationMapper,
    this.animationSheetMapper,
    this.weaponAnimationMapper,
    this.imageListMapper,
    this.blueprintMapper
  ];
}
