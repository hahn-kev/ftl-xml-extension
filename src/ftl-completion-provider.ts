import {
    CancellationToken,
    CompletionItem,
    CompletionItemKind,
    CompletionItemProvider,
    Position,
    SnippetString,
    TextDocument
} from 'vscode';
import {CompletionItem as HtmlCompletionItem, HTMLDocument, LanguageService, Node} from 'vscode-html-languageservice';
import {convertDocumentation, convertRange, toTextDocumentHtml} from './helpers';
import {DocumentCache} from './document-cache';
import {EventNamesValueSet} from './data/autocomplete-value-sets';
import {BlueprintMapper} from './ref-mappers/blueprint-mapper';
import {RefMapperBase} from './ref-mappers/ref-mapper';

export class FtlCompletionProvider implements CompletionItemProvider {
    constructor(private documentCache: DocumentCache,
                private languageService: LanguageService,
                private blueprintMapper: BlueprintMapper,
                private mappers: RefMapperBase[]) {
    }


    public async provideCompletionItems(
        document: TextDocument, position: Position, token: CancellationToken):
        Promise<CompletionItem[]> {

        let serviceDocument = toTextDocumentHtml(document);
        let htmlDocument = this.documentCache.getHtmlDocument(serviceDocument);

        let items = this.tryCompleteCustom(document, htmlDocument, position);
        if (items) return items;

        let completionItems = this.languageService.doComplete(serviceDocument, position, htmlDocument);
        return this.convertCompletionItems(completionItems.items);
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
        if (node.tag == "loadEvent" && this.shouldCompleteForNodeContents(node, offset)) {
            return this.eventNames();
        }
        if (node.parent && this.blueprintMapper.isListChild(node) && this.shouldCompleteForNodeContents(node, offset)) {
            let blueprintListNode = node.parent;
            let typeInfo = this.blueprintMapper.getListTypeInfoFromNode(blueprintListNode, document);
            if (!typeInfo) return;
            let mapper = this.blueprintMapper.getMapperForTypeName(typeInfo.listTypeName);

            if (!mapper || mapper == this.blueprintMapper || !mapper.autoCompleteValues) {
                return this.blueprintMapper.getAllBlueprintNames()
                    .map(name => ({label: name, kind: CompletionItemKind.Unit}));
            } else {
                return mapper.autoCompleteValues.values.map(value => ({
                    label: value.name,
                    kind: CompletionItemKind.Unit
                }));
            }
        }
    }

    private shouldCompleteForNodeContents(node: Node, offset: number) {
        let startTagEnd = node.startTagEnd ?? node.start;
        let endTagStart = node.endTagStart ?? -1;

        return startTagEnd <= offset && endTagStart >= offset;

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
