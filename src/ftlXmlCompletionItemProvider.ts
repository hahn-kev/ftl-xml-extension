import {
    CancellationToken,
    CompletionItem,
    CompletionItemProvider, MarkdownString,
    Position,
    Range,
    SnippetString,
    TextDocument
} from 'vscode';
import {
    CompletionItem as HtmlCompletionItem,
    HTMLDocument,
    LanguageService
} from 'vscode-html-languageservice';
import {
    convertDocumentation,
    convertRange,
    toTextDocumentHtml
} from './helpers';

export class FtlXmlCompletionItemProvider implements CompletionItemProvider {
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
            result.documentation = convertDocumentation(documentation);

            if (textEdit) {
                result.insertText = new SnippetString(textEdit.newText);
                if ('range' in textEdit) {
                    result.range = convertRange(textEdit.range);
                }
            }
            return result;
        });
    }
}
