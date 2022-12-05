/* eslint-disable no-unused-vars,@typescript-eslint/no-unused-vars */
// noinspection JSUnusedLocalSymbols

import {commands, ExtensionContext, ExtensionMode, window} from 'vscode';
import {
  AnimationNames, AnimationSheetNames,
  AugmentNames,
  ShipBlueprintNames,
  CrewNames,
  DroneNames,
  EventNamesValueSet, ImageListNames,
  ShipNames,
  SoundWaveNames,
  SystemNames,
  TextIdNames, WeaponAnimationNames,
  WeaponNames
} from './data/autocomplete-value-sets';
import {setup} from './setup';
import {addFtlDat} from './dat-fs-provider/add-ftl-dat';
import {AnimationPreview} from './animation-preview/animation-preview';


// noinspection JSUnusedGlobalSymbols
export function activate(context: ExtensionContext) {
  const {subs, workspaceParser, services} = setup(true);
  context.subscriptions.push(...subs);

  if (context.extensionMode !== ExtensionMode.Test) {
    services.output.appendLine('FTL Extension activated');
    subs.push(commands.registerCommand('ftl-xml.add-ftl-dat', async (_) => {
      await addFtlDat();
    }));
    commands.registerCommand('ftl-xml.parse-workspace', async () => {
      if (!workspaceParser.isParsing) {
        await workspaceParser.parseWorkspace();
      }
    });
    workspaceParser.parseWorkspace().then((root) => {
      // make sure that once parsing is done the animation preview context is updated
      const document = window.activeTextEditor?.document;
      AnimationPreview.updateMenuContext(root.xmlFiles.get(document?.uri.toString() ?? ''));

      const wantToUpdateDefaults = context.extensionMode == ExtensionMode.Development;
      if (wantToUpdateDefaults) {
        const eventNames = EventNamesValueSet.values.map((e) => e.name);
        const shipNames = ShipNames.values.map((v) => v.name);
        const textNames = TextIdNames.values.map((t) => t.name);
        const shipBlueprints = ShipBlueprintNames.values.map((b) => b.name);
        const weapons = WeaponNames.values.map((w) => w.name);
        const drones = DroneNames.values.map((d) => d.name);
        const augs = AugmentNames.values.map((a) => a.name);
        const crew = CrewNames.values.map((c) => c.name);
        const sys = SystemNames.values.map((s) => s.name);
        const sounds = SoundWaveNames.values.map((s) => s.name);
        const animations = AnimationNames.values.map((a) => a.name);
        const animationSheets = AnimationSheetNames.values.map((a) => a.name);
        const weaponAnimations = WeaponAnimationNames.values.map((a) => a.name);
        const imageLists = ImageListNames.values.map((a) => a.name);
        const imgFiles = root.imgFiles.map((i) => i.modPath);
        const soundFiles = root.soundWaveFiles.map((i) => i.modPath);
        const musicFiles = root.musicFiles.map((m) => m.modPath);
        const tmp = '';
      }
    });
  }
}
