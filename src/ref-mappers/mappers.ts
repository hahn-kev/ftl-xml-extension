import {RefMapper, RefMapperBase} from './ref-mapper';
import {FtlEvent} from '../models/ftl-event';
import {Node} from 'vscode-html-languageservice';
import {events} from '../events';
import {
  getAttrValueForTag,
  getFileName,
  getNodeTextContent,
  hasAttr,
  nodeTagEq,
  normalizeAttributeName
} from '../helpers';
import {
  AnimationNames,
  AnimationSheetNames,
  AugmentNames,
  AutoblueprintNames,
  CrewNames,
  CustomReqNames,
  DroneNames,
  EventNamesValueSet,
  ImageListNames,
  ShipNames,
  SoundWaveNames,
  SystemNames,
  TextIdNames,
  VariableNames,
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
import {FtlVariable} from '../models/ftl-variable';
import {FtlReq} from '../models/ftl-req';
import {FtlTextDocument} from '../models/ftl-text-document';
import {Position} from 'vscode-languageserver-textdocument';
import {EventRefParser} from './event-ref-parser';

export class Mappers {
  readonly eventsMapper = new RefMapper(
      new EventRefParser((file) => file.event, FtlEvent, events),
      EventNamesValueSet,
      'Event',
      defaultEvents
  );


  readonly shipsMapper = new RefMapper(
      new RefParser(
          (file) => file.ship,
          FtlShip,
          staticValueNodeMap([{tag: 'ship', attr: 'name'}],
              [
                {tag: 'ship', attr: 'load'},
                {tag: 'ship', parentTag: 'shipOrder', type: 'contents'}
              ]
          )
      ),
      ShipNames,
      'Ship',
      defaultShips);

  readonly weaponsMapper = new RefMapper(
      new RefParser(
          (file) => file.weapon,
          FtlWeapon,
          staticValueNodeMap([{tag: 'weaponBlueprint', attr: 'name'}],
              [
                {tag: 'weapon', attr: 'name'},
                {tag: 'weaponList', attr: 'load'},
                {tag: 'weaponBlueprint', parentTag: 'droneBlueprint', type: 'contents'}
              ]
          )
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
          new NodeMapImp(
              (context) => getAttrValueForTag(context.node,
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
            getNameDef(node: Node, document: FtlTextDocument, position?: Position): string | undefined {
              return getAttrValueForTag(node, 'shipBlueprint', 'name', document, position);
            },
            getRefName(node: Node, document: FtlTextDocument, position?: Position): string | undefined {
              return getAttrValueForTag(node, 'ship', 'auto_blueprint', document, position)
                  ?? getNodeTextContent(node, document, 'bossShip');
            }
          }
      ),
      AutoblueprintNames,
      'Auto Blueprint',
      defaultAutoBlueprints);
  variableNodeMapFunction = declarationBasedMapFunction(VariableNames);
  readonly variableMapper = new RefMapper(
      new RefParser((file) => file.variables, FtlVariable, new NodeMapImp(
          (context) => {
            const name = this.variableNodeMapFunction(context);
            return (name && getFileName(context.document) == 'hyperspace.xml') ? name : undefined;
          },
          this.variableNodeMapFunction,
      )),
      VariableNames,
      'Variable'
  );
  readonly reqMapper = new RefMapper(
      new RefParser((file) => file.reqs, FtlReq, new NodeMapImp(
          (context) => {
            return getAttrValueForTag(context.node, 'req', 'name', context.document, context.position);
          },
          () => undefined,
      )),
      CustomReqNames,
      'Requirement'
  );

  readonly textMapper = new RefMapper(
      new RefParser(
          (file) => file.text,
          FtlText,
          new NodeMapImp(
              ({node, document, position}) => {
                if (nodeTagEq(node, 'text') && hasAttr(node, 'name', document, position)) {
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
                // todo support mod tags
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
          staticValueNodeMap(
              [{tag: 'anim', attr: 'name'}],
              [{tag: 'image', type: 'contents'}, {tag: 'explosion', parentTag: 'weaponBlueprint', type: 'contents'}])
      ),
      AnimationNames,
      'Animation',
      defaultAnimations
  );

  readonly animationSheetMapper = new RefMapper(
      new RefParser((file) => file.animationSheets,
          FtlAnimationSheet,
          staticValueNodeMap([{tag: 'animSheet', attr: 'name'}], [{tag: 'sheet', type: 'contents'}])),
      AnimationSheetNames,
      'Animation Sheet',
      defaultAnimationSheets
  );

  readonly weaponAnimationMapper = new RefMapper(
      new RefParser((file) => file.weaponAnimations,
          FtlWeaponAnimation,
          staticValueNodeMap([{tag: 'weaponAnim', attr: 'name'}], [{tag: 'weaponArt', type: 'contents'}])),
      WeaponAnimationNames,
      'Weapon Animation',
      defaultWeaponAnimations,
      this.animationMapper
  );

  readonly imageListMapper = new RefMapper(
      new RefParser((file) => file.imageLists,
          FtlImageList,
          staticValueNodeMap([{tag: 'imageList', attr: 'name'}], [
            {tag: 'img', parentTag: 'event', attr: 'back'},
            {tag: 'img', parentTag: 'event', attr: 'planet'},
            {tag: 'changeBackground', type: 'contents'},
            {tag: 'win', attr: 'creditsBackground'}
          ]),
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
    this.systemMapper,
    this.variableMapper,
    this.reqMapper
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
