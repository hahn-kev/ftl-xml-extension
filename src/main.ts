import {
    CancellationToken,
    DocumentSelector,
    ExtensionContext, Hover,
    languages, MarkdownString, Position, ProviderResult, Range, TextDocument,
    window,
    workspace,
} from 'vscode';
import {getLanguageService} from "vscode-html-languageservice";
import {FtlDataProvider} from './ftl-data-provider';
import {FtlDefinitionProvider} from './ftl-definition-provider';
import {FtlParser} from './ftl-parser';
import {FltDocumentValidator} from './flt-document-validator';
import {DocumentCache} from './document-cache';
import {FtlReferenceProvider} from './ftl-reference-provider';
import {FtlXmlCompletionItemProvider} from './ftlXmlCompletionItemProvider';
import {
    convertDocumentation,
    convertRange,
    toTextDocumentHtml
} from './helpers';

const ftlXmlDoc: DocumentSelector = {language: 'ftl-xml', scheme: 'file'};

// noinspection JSUnusedGlobalSymbols
export function activate(context: ExtensionContext) {
    console.log('FTL Extension activated');

    let service = getLanguageService({useDefaultDataProvider: false});
    let documentCache = new DocumentCache(service);
    let ftlDataProvider = new FtlDataProvider();
    let ftlDefinitionProvider = new FtlDefinitionProvider(service);
    let ftlDocumentValidator = new FltDocumentValidator(documentCache);
    let ftlReferenceProvider = new FtlReferenceProvider(documentCache);

    let ftlParser = new FtlParser(documentCache);
    let ftlFilesPromise = ftlParser.parseCurrentWorkspace();
    ftlFilesPromise.then(files => ftlDataProvider.updateFtlData(files));
    ftlFilesPromise.then(files => ftlDefinitionProvider.loadFiles(files));
    ftlFilesPromise.then(files => {
        ftlDocumentValidator.loadEventNames(files);
        for (let textDocument of workspace.textDocuments) {
            ftlDocumentValidator.validateDocument(textDocument);
        }
    });

    ftlFilesPromise.then(() => {
        ftlReferenceProvider.eventRefs = ftlParser.eventRefs;
    });

    service.setDataProviders(false, [ftlDataProvider])
    languages.registerCompletionItemProvider(ftlXmlDoc, new FtlXmlCompletionItemProvider(service));
    languages.registerHoverProvider(ftlXmlDoc, {
        provideHover(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Hover> {

            let hover = service.doHover(toTextDocumentHtml(document), position, documentCache.getHtmlDocument(document), {documentation: true});
            if (!hover || !hover.range || hover.contents === '') return null;
            let documentation: string | MarkdownString | undefined;
            if (typeof hover.contents === 'object' && 'kind' in hover.contents) {
                documentation = convertDocumentation(hover.contents);
            }
            if (!documentation) return null;
            return {
                range: convertRange(hover.range),
                contents: [documentation]
            };
        }
    });

    languages.registerDefinitionProvider(ftlXmlDoc, ftlDefinitionProvider);
    window.onDidChangeActiveTextEditor(e => {
        if (e) {
            ftlDocumentValidator.validateDocument(e.document);
        }
    });
    workspace.onDidChangeTextDocument(e => {
        if (e.document) ftlDocumentValidator.validateDocument(e.document);
    });
    languages.registerReferenceProvider(ftlXmlDoc, ftlReferenceProvider);
}
