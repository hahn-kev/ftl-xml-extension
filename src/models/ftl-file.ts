import {FtlEvent} from './ftl-event';
import {FtlShip} from './ftl-ship';
import {FtlShipBlueprint} from './ftl-ship-blueprint';
import {FtlText} from './ftl-text';
import {FtlWeapon} from './ftl-weapon';
import {FtlBlueprintList} from './ftl-blueprint-list';
import {FtlDrone} from './ftl-drone';
import {FtlValue} from './ftl-value';
import {FtlAugment} from './ftlAugment';
import {FtlCrew} from './ftl-crew';
import {FtlSystem} from './ftl-system';
import {addToKey, getFileName} from '../helpers';
import {FtlSound} from './ftl-sound';
import {FtlColor} from './ftl-color';
import {FtlRoot} from './ftl-root';
import {FtlAnimation} from './ftl-animation';
import {FtlWeaponAnimation} from './ftl-weapon-animation';
import {FtlAnimationSheet} from './ftl-animation-sheet';
import {FtlImageList} from './ftl-image-list';
import {FtlVariable} from './ftl-variable';
import {FtlReq} from './ftl-req';
import {FtlTextDocument} from './ftl-text-document';
import {FtlDiagnostic} from './ftl-diagnostic';
import {Range} from 'vscode-languageserver-textdocument';
import {FtlReward} from './ftl-reward';
import {FtlSector} from './ftl-sector';
import {FtlCustomStore} from './ftl-custom-store';


export class FtlFile {
  sounds = new FtlFileValue<FtlSound>();
  animations = new FtlFileValue<FtlAnimation>();
  weaponAnimations = new FtlFileValue<FtlWeaponAnimation>();
  imageLists = new FtlFileValue<FtlImageList>();
  animationSheets = new FtlFileValue<FtlAnimationSheet>();
  shipIcons = new FtlFileValue();
  /**
   * should only be used during parsing
   */
  diagnostics: FtlDiagnostic[] = [];
  uri: string;
  fileName: string;
  firstLineRange: Range;

  constructor(document: FtlTextDocument, public root: FtlRoot) {
    this.uri = document.uri.toString();
    this.fileName = getFileName(this.uri);
    const docText = document.getText();
    let newLineIndex = docText.indexOf('\r\n');
    if (newLineIndex == -1) newLineIndex = docText.indexOf('\n');
    this.firstLineRange = {start: {line: 0, character: 0}, end: {line: 0, character: newLineIndex}};
  }

  event = new FtlFileValue<FtlEvent>();
  ship = new FtlFileValue<FtlShip>();
  shipBlueprint = new FtlFileValue<FtlShipBlueprint>();
  text = new FtlFileValue<FtlText>();
  weapon = new FtlFileValue<FtlWeapon>();
  drone = new FtlFileValue<FtlDrone>();
  augment = new FtlFileValue<FtlAugment>();
  crews = new FtlFileValue<FtlCrew>();
  system = new FtlFileValue<FtlSystem>();
  blueprintList = new FtlFileValue<FtlBlueprintList, FtlValue>();
  variables = new FtlFileValue<FtlVariable>();
  reqs = new FtlFileValue<FtlReq>();
  sectors = new FtlFileValue<FtlSector>();
  rewards = new FtlFileValue<FtlReward>();
  customStores = new FtlFileValue<FtlCustomStore>();
  colors: FtlColor[] = [];
  isReferenced = true;
  customData: Record<symbol, any> = {};
}

export class FtlFileValue<TDef extends FtlValue, TRef extends FtlValue = TDef> {
  defs: TDef[] = [];
  refs = new Map<string, TRef[]>();

  addRef(name: string, value: TRef) {
    addToKey(this.refs, name, value);
  }
}
