import {
    CancellationToken,
    CompletionItem,
    Range,
    SnippetString,
    TextDocument
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
    let ftlDataProvider = new FtlDataProvider(service);
    let ftlDefinitionProvider = new FtlDefinitionProvider(service);

    let ftlParser = new FtlParser(service);
    let ftlFilesPromise = ftlParser.parseCurrentWorkspace();
    ftlFilesPromise.then(files => ftlDataProvider.updateFtlData(files));
    ftlFilesPromise.then(files => ftlDefinitionProvider.loadFiles(files));

    service.setDataProviders(false, [ftlDataProvider])
    languages.registerCompletionItemProvider(ftlXmlDoc, new FtlXmlCompletionItemProvider(service));
    languages.registerDefinitionProvider(ftlXmlDoc, ftlDefinitionProvider)
}
