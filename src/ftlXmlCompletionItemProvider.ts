import {
    CancellationToken,
    CompletionItem, CompletionItemKind,
    CompletionItemProvider,
    Position,
    SnippetString,
    TextDocument, TextEdit
} from 'vscode';
import {
    CompletionItem as HtmlCompletionItem,
    HTMLDocument, InsertTextFormat,
    LanguageService
} from 'vscode-html-languageservice';
import {
    convertDocumentation,
    convertRange,
    toTextDocumentHtml
} from './helpers';
import {DocumentCache} from './document-cache';
import {EventNamesValueSet} from './data/ftl-data';

export class FtlXmlCompletionItemProvider implements CompletionItemProvider {
    constructor(private documentCache: DocumentCache, private languageService: LanguageService) {
    }


    public async provideCompletionItems(
        document: TextDocument, position: Position, token: CancellationToken):
        Promise<CompletionItem[]> {

        let serviceDocument = toTextDocumentHtml(document);
        let htmlDocument = this.documentCache.getHtmlDocument(serviceDocument);

        let items = this.tryCompleteCustom(document, htmlDocument, position);
        if (items) return items;

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

    private tryCompleteCustom(document: TextDocument, htmlDocument: HTMLDocument, position: Position): CompletionItem[] | undefined {
        const offset = document.offsetAt(position);
        const node = htmlDocument.findNodeBefore(offset);
        let startTagEnd = node.startTagEnd ?? node.start;
        let endTagStart = node.endTagStart ?? -1;
        if (node.tag == "loadEvent" && startTagEnd <= offset && endTagStart >= offset) {
            return this.eventNames();
        }
    }

    private eventNames(): CompletionItem[] {
        return EventNamesValueSet.values.map(value => {
            return {
                label: value.name,
                kind: CompletionItemKind.Unit,
            };
        })
    }
}
