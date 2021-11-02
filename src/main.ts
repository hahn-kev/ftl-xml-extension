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
    AutoblueprintNames,
    EventNamesValueSet,
    ShipNames,
    TextIdNames
} from './data/ftl-data';

const ftlXmlDoc: DocumentSelector = {language: 'ftl-xml', scheme: 'file'};

// noinspection JSUnusedGlobalSymbols
export function activate(context: ExtensionContext) {
    console.log('FTL Extension activated');
    let diagnosticCollection = languages.createDiagnosticCollection('ftl-xml');

    context.subscriptions.push(diagnosticCollection);

    let service = getLanguageService({useDefaultDataProvider: false});
    let documentCache = new DocumentCache(service);
    let ftlParser = new FtlParser(documentCache);

    let ftlDataProvider = new FtlDataProvider(ftlParser.onFileParsed);
    service.setDataProviders(false, [ftlDataProvider]);

    let ftlDefinitionProvider = new FtlDefinitionProvider(documentCache, ftlParser.onFileParsed);
    let ftlDocumentValidator = new FltDocumentValidator(documentCache, ftlParser.onFileParsed, diagnosticCollection);
    let ftlReferenceProvider = new FtlReferenceProvider(documentCache, ftlParser.onFileParsed);
    let hoverProvider = new FtlHoverProvider(documentCache, service);
    let completionItemProvider = new FtlCompletionProvider(documentCache, service);

    let ftlFilesPromise = ftlParser.parseCurrentWorkspace();

    ftlFilesPromise.then(() => {
        for (let textDocument of workspace.textDocuments) {
            ftlDocumentValidator.validateDocument(textDocument);
        }
        let wantToUpdateDefaults = true;
        if (wantToUpdateDefaults) {
            let eventNames = EventNamesValueSet.values.map(e => e.name);
            let shipNames = ShipNames.values.map(v => v.name);
            let textNames = TextIdNames.values.map(t => t.name);
            let blueprints = AutoblueprintNames.values.map(b => b.name);
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
