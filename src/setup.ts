import {FtlParser} from './ftl-parser';
import {FltDocumentValidator} from './flt-document-validator';
import {CodeActionKind, CodeActionProviderMetadata, DocumentSelector, languages, window, workspace} from 'vscode';
import {getLanguageService} from 'vscode-html-languageservice';
import {DocumentCache} from './document-cache';
import {mappers} from './ref-mappers/mappers';
import {FtlDataProvider} from './ftl-data-provider';
import {FtlDefinitionProvider} from './ftl-definition-provider';
import {FtlReferenceProvider} from './ftl-reference-provider';
import {FtlHoverProvider} from './ftl-hover-provider';
import {FtlCompletionProvider} from './ftl-completion-provider';
import {FtlCodeActionProvider} from './ftl-code-action-provider';

export type disposable = { dispose(): any };

export function setup(): { ftlParser: FtlParser; ftlDocumentValidator: FltDocumentValidator; subs: disposable[] } {
    const ftlXmlDoc: DocumentSelector = {language: 'ftl-xml', scheme: 'file'};
    let diagnosticCollection = languages.createDiagnosticCollection('ftl-xml');
    let service = getLanguageService({useDefaultDataProvider: false});
    let documentCache = new DocumentCache(service);
    let {mappers: mappersList, blueprintMapper} = mappers.setup(documentCache);
    let ftlParser = new FtlParser(documentCache, mappersList);
    let ftlDataProvider = new FtlDataProvider(ftlParser.onFileParsed, mappersList);
    let ftlCodeAction = new FtlCodeActionProvider(documentCache);
    service.setDataProviders(false, [ftlDataProvider]);

    let ftlDefinitionProvider = new FtlDefinitionProvider(documentCache, mappersList);
    let ftlDocumentValidator = new FltDocumentValidator(documentCache,
                                                        diagnosticCollection,
                                                        blueprintMapper,
                                                        mappersList);
    let ftlReferenceProvider = new FtlReferenceProvider(documentCache, mappersList);
    let hoverProvider = new FtlHoverProvider(documentCache, service);
    let completionItemProvider = new FtlCompletionProvider(documentCache, service, blueprintMapper, mappersList);

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

    let metadata: CodeActionProviderMetadata = {
        providedCodeActionKinds: [
            CodeActionKind.QuickFix
        ]
    };
    return {
        ftlParser,
        ftlDocumentValidator,
        subs: [
            diagnosticCollection,
            languages.registerCompletionItemProvider(ftlXmlDoc, completionItemProvider, '<', '"'),
            languages.registerHoverProvider(ftlXmlDoc, hoverProvider),
            languages.registerDefinitionProvider(ftlXmlDoc, ftlDefinitionProvider),
            languages.registerReferenceProvider(ftlXmlDoc, ftlReferenceProvider),
            languages.registerCodeActionsProvider(ftlXmlDoc, ftlCodeAction, metadata)
        ]
    };
}
