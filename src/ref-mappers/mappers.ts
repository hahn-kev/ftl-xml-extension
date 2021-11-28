import {RefMapper, RefMapperBase} from './ref-mapper';
import {FtlEvent} from '../models/ftl-event';
import {Node} from 'vscode-html-languageservice';
import {Position, TextDocument} from 'vscode';
import {events} from '../events';
import {fileName, getAttrValueForTag, getNodeTextContent, hasAttr, normalizeAttributeName} from '../helpers';
import {
  AnimationNames,
  AnimationSheetNames,
  AugmentNames,
  AutoblueprintNames,
  CrewNames,
  DroneNames,
  EventNamesValueSet,
  ShipNames,
  SoundNames,
  SystemNames,
  TextIdNames,
  WeaponAnimationNames,
  WeaponNames
} from '../data/autocomplete-value-sets';
import {defaultEvents} from '../data/default-events';
import {FtlShip} from '../models/ftl-ship';
import {defaultShips} from '../data/default-ships';
import {FtlWeapon} from '../models/ftl-weapon';
import {FtlAutoblueprint} from '../models/ftl-autoblueprint';
import {defaultAutoBlueprints} from '../data/default-auto-blueprints';
import {FtlText} from '../models/ftl-text';
import {BlueprintMapper} from '../blueprints/blueprint-mapper';
import {DocumentCache} from '../document-cache';
import {defaultWeaponBlueprints} from '../data/default-weapon-blueprints';
import {FtlDrone} from '../models/ftl-drone';
import {defaultDrones} from '../data/default-drones';
import {FtlAugment} from '../models/ftlAugment';
import {defaultAugments} from '../data/default-augments';
import {FtlCrew} from '../models/ftl-crew';
import {defaultCrew} from '../data/default-crew';
import {FtlSystem} from '../models/ftl-system';
import {defaultSystems} from '../data/default-systems';
import {defaultText} from '../data/default-text';
import {RefParser} from './ref-parser';
import {FtlSound} from '../models/ftl-sound';
import {defaultSounds} from '../data/default-sounds';
import {Sounds} from '../sounds';
import {FtlAnimation} from '../models/ftl-animation';
import {defaultAnimations} from '../data/default-animations';
import {FtlAnimationSheet} from '../models/ftl-animation-sheet';
import {defaultAnimationSheets} from '../data/default-animation-sheets';
import {FtlWeaponAnimation} from '../models/ftl-weapon-animation';
import {defaultWeaponAnimations} from '../data/default-weapon-animations';

class Mappers {
  readonly eventsMapper = new RefMapper(new RefParser((file) => file.event, FtlEvent, events),
      EventNamesValueSet,
      'Event',
      defaultEvents);


  readonly shipsMapper = new RefMapper(
      new RefParser(
          (file) => file.ship,
          FtlShip,
          {
            getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
              return getAttrValueForTag(node, 'ship', 'name', document, position);
            },
            getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
              if (node.tag == 'ship' && node.parent?.tag == 'shipOrder') return getNodeTextContent(node, document);
              return getAttrValueForTag(node, 'ship', 'load', document, position);
            }
          }
      ),
      ShipNames,
      'Ship',
      defaultShips);

  readonly weaponsMapper = new RefMapper(
      new RefParser(
          (file) => file.weapon,
          FtlWeapon,
          {
            getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
              return getAttrValueForTag(node, 'weaponBlueprint', 'name', document, position);
            },
            getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
              const name = getAttrValueForTag(node, 'weapon', 'name', document, position);
              if (name) return name;
              if (node.tag == 'weaponBlueprint' && node.parent?.tag == 'droneBlueprint' && !node.attributes) {
                return getNodeTextContent(node, document);
              }
            }
          }
      ),
      WeaponNames,
      'Weapon',
      defaultWeaponBlueprints);

  readonly dronesMapper = new RefMapper(
      new RefParser(
          (file) => file.drone,
          FtlDrone,
          {
            getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
              return getAttrValueForTag(node, 'droneBlueprint', 'name', document, position);
            },
            getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
              return getAttrValueForTag(node, 'drone', 'name', document, position);
            }
          }
      ),
      DroneNames,
      'Drone',
      defaultDrones);

  readonly augmentsMapper = new RefMapper(
      new RefParser(
          (file) => file.augment,
          FtlAugment,
          {
            getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
              return getAttrValueForTag(node,
                  'augBlueprint',
                  'name',
                  document,
                  position);
            },
            getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
              return getAttrValueForTag(node, 'augment', 'name', document, position)
                  ?? getAttrValueForTag(node, 'aug', 'name', document, position);
            }
          }
      ),
      AugmentNames,
      'Augment',
      defaultAugments);

  readonly crewMapper = new RefMapper(
      new RefParser(
          (file) => file.crews,
          FtlCrew,
          {
            getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
              return getAttrValueForTag(node,
                  'crewBlueprint',
                  'name',
                  document,
                  position);
            },
            getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
              return getAttrValueForTag(node, 'crewMember', 'class', document, position)
                  ?? getAttrValueForTag(node, 'crewMember', 'type', document, position)
                  ?? getAttrValueForTag(node, 'removeCrew', 'class', document, position);
            }
          }
      ),
      CrewNames,
      'Crew',
      defaultCrew);

  readonly systemMapper = new RefMapper(
      new RefParser(
          (file) => file.system,
          FtlSystem,
          {
            getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
              return getAttrValueForTag(node,
                  'systemBlueprint',
                  'name',
                  document,
                  position);
            },
            getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
              return getAttrValueForTag(node, 'status', 'system', document, position)
                  ?? getAttrValueForTag(node, 'upgrade', 'system', document, position)
                  ?? getAttrValueForTag(node, 'damage', 'system', document, position);
            }
          }
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
              return getAttrValueForTag(node, 'ship', 'auto_blueprint', document, position) ?? getNodeTextContent(node,
                  document,
                  'bossShip');
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
          {
            getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
              if (node.tag == 'text' && hasAttr(node, 'name', document, position)) {
                // filter out language files
                if (fileName(document)?.startsWith('text-')) {
                  return undefined;
                }
                return normalizeAttributeName(node.attributes.name);
              }

              return getAttrValueForTag(node, 'textList', 'name', document, position);
            },
            getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
              return getAttrValueForTag(node, 'text', 'load', document, position)
                  ?? getAttrValueForTag(node, 'text', 'name', document, position)
                  ?? getAttrValueForTag(node, 'text', 'id', document, position)
                  ?? getAttrValueForTag(node, 'title', 'id', document, position)
                  ?? getAttrValueForTag(node, 'short', 'id', document, position)
                  ?? getAttrValueForTag(node, 'desc', 'id', document, position)
                  ?? getAttrValueForTag(node, 'tooltip', 'id', document, position)
                  ?? getAttrValueForTag(node, 'flavorType', 'id', document, position)
                  ?? getNodeTextContent(node, document, 'tip');
            }
          }
      ),
      TextIdNames,
      'Text',
      defaultText);

  readonly soundMapper = new RefMapper(
      new RefParser((file) => file.sounds,
          FtlSound,
          {
            getNameDef: (node: Node, document: TextDocument, position?: Position): string | undefined => {
              return Sounds.isSoundNode(node, document) ? node.tag : undefined;
            },
            getRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
              return getNodeTextContent(node, document, 'sound')
                  ?? getNodeTextContent(node, document, 'powerSound')
                  ?? getNodeTextContent(node, document, 'shootingSound')
                  ?? getNodeTextContent(node, document, 'deathSound')
                  ?? getNodeTextContent(node, document, 'finishSound')
                  ?? getNodeTextContent(node, document, 'repairSound')
                  ?? getNodeTextContent(node, document, 'timerSound');
            }
          }),
      SoundNames,
      'Sound',
      defaultSounds
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
      defaultWeaponAnimations
  );


  public setup(documentCache: DocumentCache) {
    const blueprintMappers: RefMapperBase[] = [
      this.weaponsMapper,
      this.autoBlueprintMapper,
      this.dronesMapper,
      this.augmentsMapper,
      this.crewMapper,
      this.systemMapper
    ];
    const blueprintMapper = new BlueprintMapper(blueprintMappers);
    const mappers: RefMapperBase[] = [
      this.eventsMapper,
      this.shipsMapper,
      this.textMapper,
      this.soundMapper,
      this.animationMapper,
      this.animationSheetMapper,
      this.weaponAnimationMapper,
      blueprintMapper
    ];
    return {blueprintMapper, mappers};
  }
}

export const mappers = new Mappers();
