import {RefMapper, RefMapperBase} from './ref-mapper';
import {FtlEvent} from '../models/ftl-event';
import {events} from '../events';
import {
  getAttrValue,
  getAttrValueForTag,
  getAttrValueName,
  getFileName,
  getNodeContent,
  hasAttr,
  nodeTagEq,
  normalizeTagName,
  toRange
} from '../helpers';
import {
  AnimationNames,
  AnimationSheetNames,
  AugmentNames,
  AutoRewardsValueSet,
  CrewNames,
  ReqNames,
  DroneNames,
  EventNamesValueSet,
  ImageListNames,
  SectorsValueSet,
  ShipBlueprintNames,
  ShipIconNames,
  ShipNames,
  SoundWaveNames,
  SystemNames,
  TextIdNames,
  VariableNames,
  WeaponAnimationNames,
  WeaponNames,
  StoresValueSet
} from '../data/autocomplete-value-sets';
import {defaultEvents} from '../data/default-ftl-data/default-events';
import {FtlShip} from '../models/ftl-ship';
import {defaultShips} from '../data/default-ftl-data/default-ships';
import {FtlWeapon} from '../models/ftl-weapon';
import {FtlShipBlueprint} from '../models/ftl-ship-blueprint';
import {defaultShipBlueprints} from '../data/default-ftl-data/default-ship-blueprints';
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
import {FtlVariable} from '../models/ftl-variable';
import {FtlReq} from '../models/ftl-req';
import {EventRefParser} from './event-ref-parser';
import {FtlGenericValue} from '../models/ftl-value';
import {NodeMapContext} from './node-mapping/node-map-context';
import {StaticValueMapping, staticValueNodeMap} from './node-mapping/static-node-map';
import {NodeMapImp} from './node-mapping/node-map';
import {declarationBasedMapFunction} from './node-mapping/declaration-node-map';
import {ValueName} from './value-name';
import {defaultAutoRewards} from '../data/default-ftl-data/default-auto-rewards';
import {FtlReward} from '../models/ftl-reward';
import {FtlSector} from '../models/ftl-sector';
import {defaultSectors} from '../data/default-ftl-data/default-sectors';
import {FtlCustomStore} from '../models/ftl-custom-store';

function storeCategoryMatcher(type: string): StaticValueMapping {
  return {
    tag: 'blueprint',
    type: 'contents',
    parentTag: 'item',
    match: c => nodeTagEq(c.node.parent?.parent, 'category')
        && getAttrValue(c.node.parent?.parent, 'type') == type
  };
}

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
          staticValueNodeMap([{tag: 'ship', attr: 'name', match: (c) => !nodeTagEq(c.node.parent, 'ships')}],
              [
                {tag: 'ship', attr: 'load', parentTag: 'event'}
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
                {tag: 'weaponBlueprint', parentTag: 'droneBlueprint', type: 'contents'},
                {tag: 'artillery', parentTag: 'systemList', attr: 'weapon'},
                storeCategoryMatcher('WEAPONS')
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
          staticValueNodeMap(
              [{tag: 'droneBlueprint', attr: 'name'}],
              [
                {tag: 'drone', attr: 'name'},
                storeCategoryMatcher('DRONES')
              ])
      ),
      DroneNames,
      'Drone',
      defaultDrones);

  readonly augmentsMapper = new RefMapper(
      new RefParser(
          (file) => file.augment,
          FtlAugment,
          staticValueNodeMap(
              [{tag: 'augBlueprint', attr: 'name'}],
              [
                {tag: 'hiddenAug', type: 'contents'},
                {tag: 'augment', attr: 'name'},
                {tag: 'aug', attr: 'name'},
                {tag: 'function', attr: 'name'},
                storeCategoryMatcher('AUGMENTS')
              ]
          )
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
                {tag: 'transformRace', type: 'contents'},
                storeCategoryMatcher('CREW')
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
                {tag: 'damage', attr: 'system'},
                storeCategoryMatcher('SYSTEMS')
              ])
      ),
      SystemNames,
      'System',
      defaultSystems);


  readonly shipBlueprintMapper = new RefMapper(
      new RefParser(
          (file) => file.shipBlueprint,
          FtlShipBlueprint,
          new NodeMapImp(
              ({document, node}) => {
                return getAttrValueForTag(node, 'shipBlueprint', 'name', document);
              },
              ({document, node}: NodeMapContext) => {
                if (nodeTagEq(node.parent, 'ships') && nodeTagEq(node, 'ship')) {
                  const shipName = getAttrValueForTag(node, 'ship', 'name', document);
                  if (!shipName) return undefined;
                  const results: ValueName[] = [];
                  const shipNameB = shipName.name + '_2';
                  const shipNameC = shipName.name + '_3';

                  const bValueName = getAttrValueForTag(node, 'ship', 'b', document);
                  const hasB = bValueName?.name == 'true';
                  if (hasB) results.push(new ValueName(shipNameB, bValueName.range));

                  const cValueName = getAttrValueForTag(node, 'ship', 'c', document);
                  const hasC = cValueName?.name == 'true';
                  if (hasC) results.push(new ValueName(shipNameC, cValueName.range));

                  results.unshift(shipName);
                  return results;
                }
                return getAttrValueForTag(node, 'ship', 'auto_blueprint', document)
                    ?? getAttrValueForTag(node, 'customShip', 'name', document)
                    ?? getAttrValueForTag(node, 'unlockShip', 'shipReq', document)
                    ?? getAttrValueForTag(node, 'unlockCustomShip', 'shipReq', document)
                    ?? getNodeContent(node, document, 'bossShip')
                    ?? getNodeContent(node, document, 'shipReq')
                    ?? getNodeContent(node, document, 'ship', 'otherUnlocks')
                    ?? getNodeContent(node, document, 'ship', 'shipOrder')
                    ?? getNodeContent(node, document, 'victory')
                    ?? getNodeContent(node, document, 'unlockCustomShip');
              })
      ),
      ShipBlueprintNames,
      'Ship Blueprint',
      defaultShipBlueprints);
  variableNodeMapFunction = declarationBasedMapFunction(VariableNames);
  readonly variableMapper = new RefMapper(
      new RefParser((file) => file.variables, FtlVariable, new NodeMapImp(
          (context) => {
            const name = this.variableNodeMapFunction(context);
            return (name && getFileName(context.document).startsWith('hyperspace.xml')) ? name : undefined;
          },
          this.variableNodeMapFunction,
      )),
      VariableNames,
      'Variable'
  );

  readonly sectorMapper = new RefMapper(
      new RefParser(
          file => file.sectors,
          FtlSector,
          new NodeMapImp(
              c => getAttrValueForTag(c.node, 'sectorDescription', 'name', c.document),
              c => {
                const reqValue = getAttrValueForTag(c.node, 'choice', 'req', c.document);
                if (!reqValue || !reqValue.name.startsWith('SEC ')) return;
                reqValue.name = reqValue.name.slice('SEC '.length);
                return reqValue;
              }
          )
      ),
      SectorsValueSet,
      'Sector',
      defaultSectors
  );

  readonly reqMapper = new RefMapper(
      new RefParser((file) => file.reqs, FtlReq, new NodeMapImp(
          (context) => {
            return getAttrValueForTag(context.node, 'req', 'name', context.document);
          },
          () => undefined,
      )),
      ReqNames,
      'Requirement'
  );

  readonly rewardMapper = new RefMapper(
      new RefParser(
          file => file.rewards,
          FtlReward,
          new NodeMapImp(
              (context) => getAttrValueForTag(context.node, 'reward', 'name', context.document),
              declarationBasedMapFunction(AutoRewardsValueSet))
      ),
      AutoRewardsValueSet,
      'Rewards',
      defaultAutoRewards
  );

  readonly textMapper = new RefMapper(
      new RefParser(
          (file) => file.text,
          FtlText,
          new NodeMapImp(
              ({node, document}) => {
                if (nodeTagEq(node, 'text') && hasAttr(node, 'name', document)) {
                  // filter out language files
                  if (getFileName(document)?.startsWith('text-')) {
                    return undefined;
                  }
                  return getAttrValueName(node, 'name', document);
                }

                return getAttrValueForTag(node, 'textList', 'name', document);
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
              (c) => {
                if (!Sounds.isWaveNode(c.node, c.document)) return;
                return new ValueName(
                    normalizeTagName(c.node.tag, c.node),
                    toRange(c.node.start + 1, c.node.start + c.node.tag.length + 1, c.document)
                );
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
              [
                {tag: 'image', type: 'contents', parentTag: 'weaponBlueprint'},
                {tag: 'explosion', parentTag: 'weaponBlueprint', type: 'contents'}
              ])
      ),
      AnimationNames,
      'Animation',
      defaultAnimations
  );

  readonly animationSheetMapper = new RefMapper(
    new RefParser((file) => file.animationSheets,
      FtlAnimationSheet,
      staticValueNodeMap(
        [{ tag: 'animSheet', attr: 'name', parentTag: '!race'}],
        [{ tag: 'sheet', type: 'contents' }, { tag: 'animSheet', parentTag: 'race', type: 'contents' }]
      )),
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

  static readonly shipIconNodeMap = new NodeMapImp(
      (context) => {
        if (!nodeTagEq(context.node.parent?.parent, 'shipIcons')) return undefined;
        return getNodeContent(context.node, context.document, 'name', 'shipIcon');
      },
      (context) => {
        if (!nodeTagEq(context.node.parent?.parent, 'customShip')) return undefined;
        return getNodeContent(context.node, context.document, 'shipIcon', 'shipIcons');
      });
  readonly shipIconMapper = new RefMapper(
      new RefParser((file) => file.shipIcons,
          FtlGenericValue,
          Mappers.shipIconNodeMap,
      ),
      ShipIconNames,
      'Ship Icon');

  readonly customStoreMapper = new RefMapper(
      new RefParser((file) => file.customStores,
          FtlCustomStore,
          staticValueNodeMap([{tag: 'customStore', parentTag: 'store', attr: 'id'}], [
            {tag: 'store', parentTag: 'event', type: 'contents'},
            {tag: 'customStore', parentTag: 'event', type: 'contents'},
          ]),
      ),
      StoresValueSet,
      'Store',
      []
  );
  readonly blueprintMappers = [
    this.weaponsMapper,
    this.shipBlueprintMapper,
    this.dronesMapper,
    this.augmentsMapper,
    this.crewMapper,
    this.systemMapper,
    this.variableMapper,
    this.reqMapper
  ];
  readonly blueprintMapper = new BlueprintMapper(this.blueprintMappers);

  readonly list: RefMapperBase[] = [
    this.eventsMapper,
    this.shipsMapper,
    this.textMapper,
    this.soundWaveMapper,
    this.animationMapper,
    this.animationSheetMapper,
    this.weaponAnimationMapper,
    this.imageListMapper,
    this.shipIconMapper,
    this.blueprintMapper,
    this.rewardMapper,
    this.sectorMapper,
    this.customStoreMapper
  ];
}
