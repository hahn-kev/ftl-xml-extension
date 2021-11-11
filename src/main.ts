import {ExtensionContext, ExtensionMode, workspace,} from 'vscode';
import {
    AugmentNames,
    AutoblueprintNames,
    CrewNames,
    DroneNames,
    EventNamesValueSet,
    ShipNames,
    SystemNames,
    TextIdNames,
    WeaponNames
} from './data/autocomplete-value-sets';
import {setup} from './setup';


// noinspection JSUnusedGlobalSymbols
export function activate(context: ExtensionContext) {
    let {subs, ftlParser, ftlDocumentValidator} = setup();
    context.subscriptions.push(...subs);

    if (context.extensionMode !== ExtensionMode.Test) {
        console.log('FTL Extension activated');
        let ftlFilesPromise = ftlParser.parseCurrentWorkspace();

        ftlFilesPromise.then(async (files) => {
            let fileUris = Array.from(files.values()).map(file => file.uri);
            for (let fileUri of fileUris) {
                ftlDocumentValidator.validateDocument(await workspace.openTextDocument(fileUri));
            }
            let wantToUpdateDefaults = true;
            if (wantToUpdateDefaults) {
                let eventNames = EventNamesValueSet.values.map(e => e.name);
                let shipNames = ShipNames.values.map(v => v.name);
                let textNames = TextIdNames.values.map(t => t.name);
                let autoBlueprints = AutoblueprintNames.values.map(b => b.name);
                let weapons = WeaponNames.values.map(w => w.name);
                let drones = DroneNames.values.map(d => d.name);
                let augs = AugmentNames.values.map(a => a.name);
                let crew = CrewNames.values.map(c => c.name);
                let sys = SystemNames.values.map(s => s.name);
                let tmp = '';
            }
        });
    }


}
