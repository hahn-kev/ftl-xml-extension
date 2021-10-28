import { CancellationToken, CompletionItem, TextDocument } from 'vscode';
import { ExtensionContext, languages, DocumentSelector, CompletionItemProvider, Position } from 'vscode';
import { getLanguageService, LanguageService, TextDocument as HtmlTextDocument, CompletionItem as HtmlCompletionItem } from "vscode-html-languageservice";
const ftlXmlDoc: DocumentSelector = { language: 'ftl-xml' };

class FtlXmlCompletionItemProvider implements CompletionItemProvider {
    constructor(languageService: LanguageService) {
        this.htmlLanguageService = languageService;
    }
    private htmlLanguageService: LanguageService;

    public async provideCompletionItems(
        document: TextDocument, position: Position, token: CancellationToken):
        Promise<CompletionItem[]> {

        let serviceDocument: HtmlTextDocument = { ...document, uri: document.uri.toString() };
        let completionItems = this.htmlLanguageService.doComplete(serviceDocument, position, this.htmlLanguageService.parseHTMLDocument(serviceDocument));
        return this.convertCompletionItems(completionItems.items);
    }

    convertCompletionItems(items: HtmlCompletionItem[]): CompletionItem[] {
        return items.map(item => {
            let {documentation, textEdit, additionalTextEdits, ...rest} = item;
        
            return {...rest};
        });
    }
}

export function activate(context: ExtensionContext) {
    let service = getLanguageService({useDefaultDataProvider: false});
    // service.setDataProviders(false, [{}])
    languages.registerCompletionItemProvider(ftlXmlDoc, new FtlXmlCompletionItemProvider(service));
}