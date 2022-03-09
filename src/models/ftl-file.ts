import {FtlEvent} from './ftl-event';
import {Diagnostic, Range, TextDocument, Uri} from 'vscode';
import {FtlShip} from './ftl-ship';
import {FtlAutoblueprint} from './ftl-autoblueprint';
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


export class FtlFile {
  sounds = new FtlFileValue<FtlSound>();
  animations = new FtlFileValue<FtlAnimation>();
  weaponAnimations = new FtlFileValue<FtlWeaponAnimation>();
  imageLists = new FtlFileValue<FtlImageList>();
  animationSheets = new FtlFileValue<FtlAnimationSheet>();
  diagnostics: Diagnostic[] = [];
  uri: Uri;
  fileName: string;
  firstLineRange: Range;

  constructor(document: TextDocument, public root: FtlRoot) {
    this.uri = document.uri;
    this.fileName = getFileName(this.uri);
    this.firstLineRange = document.lineAt(0).range;
  }

  event = new FtlFileValue<FtlEvent>();
  ship = new FtlFileValue<FtlShip>();
  autoBlueprint = new FtlFileValue<FtlAutoblueprint>();
  text = new FtlFileValue<FtlText>();
  weapon = new FtlFileValue<FtlWeapon>();
  drone = new FtlFileValue<FtlDrone>();
  augment = new FtlFileValue<FtlAugment>();
  crews = new FtlFileValue<FtlCrew>();
  system = new FtlFileValue<FtlSystem>();
  blueprintList = new FtlFileValue<FtlBlueprintList, FtlValue>();
  variables = new FtlFileValue<FtlVariable>();
  reqs = new FtlFileValue<FtlReq>();
  colors: FtlColor[] = [];
  isReferenced = true;
}

export class FtlFileValue<TDef extends FtlValue, TRef extends FtlValue = TDef> {
  defs: TDef[] = [];
  refs = new Map<string, TRef[]>();

  addRef(name: string, value: TRef) {
    addToKey(this.refs, name, value);
  }
}
