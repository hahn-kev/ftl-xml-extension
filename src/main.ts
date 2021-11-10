import {
    DocumentSelector,
    ExtensionContext, languages, window,
    workspace,
} from 'vscode';
import {getLanguageService} from "vscode-html-languageservice";
import {FtlDataProvider} from './ftl-data-provider';
import {FtlDefinitionProvider} from './ftl-definition-provider';
import {FtlParser} from './ftl-parser';
import {FltDocumentValidator} from './flt-document-validator';
import {DocumentCache} from './document-cache';
import {FtlReferenceProvider} from './ftl-reference-provider';
import {FtlCompletionProvider} from './ftl-completion-provider';
import {FtlHoverProvider} from './ftl-hover-provider';
import {
    AugmentNames,
    AutoblueprintNames, CrewNames,
    DroneNames,
    EventNamesValueSet,
    ShipNames,
    TextIdNames,
    WeaponNames
} from './data/autocomplete-value-sets';
import {mappers} from './ref-mappers/mappers';

const ftlXmlDoc: DocumentSelector = {language: 'ftl-xml', scheme: 'file'};

// noinspection JSUnusedGlobalSymbols
export function activate(context: ExtensionContext) {
    console.log('FTL Extension activated');
    let diagnosticCollection = languages.createDiagnosticCollection('ftl-xml');

    context.subscriptions.push(diagnosticCollection);

    let service = getLanguageService({useDefaultDataProvider: false});
    let documentCache = new DocumentCache(service);
    let {mappers: mappersList, blueprintMapper} = mappers.setup(documentCache);
    let ftlParser = new FtlParser(documentCache, mappersList);
    let ftlDataProvider = new FtlDataProvider(ftlParser.onFileParsed, mappersList);
    service.setDataProviders(false, [ftlDataProvider]);

    let ftlDefinitionProvider = new FtlDefinitionProvider(documentCache, mappersList);
    let ftlDocumentValidator = new FltDocumentValidator(documentCache, diagnosticCollection, blueprintMapper, mappersList);
    let ftlReferenceProvider = new FtlReferenceProvider(documentCache, mappersList);
    let hoverProvider = new FtlHoverProvider(documentCache, service);
    let completionItemProvider = new FtlCompletionProvider(documentCache, service, blueprintMapper, mappersList);

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
            let tmp = '';
        }
    });


    context.subscriptions.push(
        languages.registerCompletionItemProvider(ftlXmlDoc, completionItemProvider, '<', '"'),
        languages.registerHoverProvider(ftlXmlDoc, hoverProvider),
        languages.registerDefinitionProvider(ftlXmlDoc, ftlDefinitionProvider),
        languages.registerReferenceProvider(ftlXmlDoc, ftlReferenceProvider),
    );

    window.onDidChangeActiveTextEditor(e => {
        if (e) {
            ftlDocumentValidator.validateDocument(e.document);
        }
    });
    workspace.onDidChangeTextDocument(e => {
        if (e.document) {
            ftlParser.parseFile(e.document.uri, e.document);
            ftlDocumentValidator.validateDocument(e.document);
        }
    });
}
