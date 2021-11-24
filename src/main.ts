/* eslint-disable no-unused-vars,@typescript-eslint/no-unused-vars */
// noinspection JSUnusedLocalSymbols

import {commands, ExtensionContext, ExtensionMode} from 'vscode';
import {
  AugmentNames,
  AutoblueprintNames,
  CrewNames,
  DroneNames,
  EventNamesValueSet,
  ShipNames,
  SoundNames,
  SystemNames,
  TextIdNames,
  WeaponNames
} from './data/autocomplete-value-sets';
import {parseWorkspace, setup} from './setup';


// noinspection JSUnusedGlobalSymbols
export function activate(context: ExtensionContext) {
  const {subs, ftlParser, ftlDocumentValidator} = setup();
  context.subscriptions.push(...subs);

  if (context.extensionMode !== ExtensionMode.Test) {
    console.log('FTL Extension activated');
    commands.registerCommand('ftl-xml.parse-workspace', async () => {
      if (!ftlParser.isParsing) {
        await parseWorkspace(ftlParser, ftlDocumentValidator);
      }
    });
    parseWorkspace(ftlParser, ftlDocumentValidator).then(() => {
      const wantToUpdateDefaults = context.extensionMode == ExtensionMode.Development;
      if (wantToUpdateDefaults) {
        const eventNames = EventNamesValueSet.values.map((e) => e.name);
        const shipNames = ShipNames.values.map((v) => v.name);
        const textNames = TextIdNames.values.map((t) => t.name);
        const autoBlueprints = AutoblueprintNames.values.map((b) => b.name);
        const weapons = WeaponNames.values.map((w) => w.name);
        const drones = DroneNames.values.map((d) => d.name);
        const augs = AugmentNames.values.map((a) => a.name);
        const crew = CrewNames.values.map((c) => c.name);
        const sys = SystemNames.values.map((s) => s.name);
        const sounds = SoundNames.values.map((s) => s.name);
        const tmp = '';
      }
    });
  }
}
