import {
    CancellationToken,
    CompletionItem,
    Range,
    SnippetString,
    TextDocument, window, workspace
} from 'vscode';
import {
    ExtensionContext,
    languages,
    DocumentSelector,
    CompletionItemProvider,
    Position
} from 'vscode';
import {
    getLanguageService,
    LanguageService,
    TextDocument as HtmlTextDocument,
    CompletionItem as HtmlCompletionItem, HTMLDocument
} from "vscode-html-languageservice";
import {FtlDataProvider} from './ftl-data-provider';
import {FtlDefinitionProvider} from './ftl-definition-provider';
import {toTextDocumentHtml} from './helpers';
import {FtlParser} from './ftl-parser';
import {FltDocumentValidator} from './flt-document-validator';
import {DocumentCache} from './document-cache';
import {FtlReferenceProvider} from './ftl-reference-provider';

const ftlXmlDoc: DocumentSelector = {language: 'ftl-xml'};

class FtlXmlCompletionItemProvider implements CompletionItemProvider {
    constructor(private languageService: LanguageService) {
    }


    public async provideCompletionItems(
        document: TextDocument, position: Position, token: CancellationToken):
        Promise<CompletionItem[]> {

        let serviceDocument = toTextDocumentHtml(document);
        let htmlDocument = this.languageService.parseHTMLDocument(serviceDocument);
        let completionItems = this.languageService.doComplete(serviceDocument, position, htmlDocument);
        return this.convertCompletionItems(completionItems.items).concat(this.provideAdditionalItems(document, position, htmlDocument));
    }

    private provideAdditionalItems(document: TextDocument, position: Position, htmlDocument: HTMLDocument): CompletionItem[] {
        const offset = document.offsetAt(position);
        const node = htmlDocument.findNodeBefore(offset);

        return [];
    }

    convertCompletionItems(items: HtmlCompletionItem[]): CompletionItem[] {
        return items.filter(value => value.label !== 'data-').map(item => {
            let {documentation, textEdit, additionalTextEdits, ...rest} = item;
            let result: CompletionItem = {...rest};
            if (textEdit) {
                result.insertText = new SnippetString(textEdit.newText);
                if ('range' in textEdit) {
                    let start = textEdit.range.start;
                    let end = textEdit.range.end;
                    result.range = new Range(new Position(start.line, start.character), new Position(end.line, end.character));
                }
            }
            return result;
        });
    }
}

// noinspection JSUnusedGlobalSymbols
export function activate(context: ExtensionContext) {

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
    languages.registerDefinitionProvider(ftlXmlDoc, ftlDefinitionProvider);
    window.onDidChangeActiveTextEditor(e => {
        if (e)
            ftlDocumentValidator.validateDocument(e.document);
    });
    languages.registerReferenceProvider(ftlXmlDoc, ftlReferenceProvider);
}
