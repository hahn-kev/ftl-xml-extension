import {
    CancellationToken,
    CompletionItem,
    CompletionItemKind,
    CompletionItemProvider,
    Position,
    SnippetString,
    TextDocument
} from 'vscode';
import {
    CompletionItem as HtmlCompletionItem,
    HTMLDocument,
    IValueSet,
    LanguageService,
    Node
} from 'vscode-html-languageservice';
import {convertDocumentation, convertRange, toTextDocumentHtml} from '../helpers';
import {DocumentCache} from '../document-cache';
import {BlueprintMapper} from '../ref-mappers/blueprint-mapper';
import {RefMapperBase} from '../ref-mappers/ref-mapper';
import {FtlData, XmlTag} from '../data/ftl-data';
import {ShipNames} from '../data/autocomplete-value-sets';

export class FtlCompletionProvider implements CompletionItemProvider {
    private completeContentMap: Map<string, IValueSet>;

    constructor(private documentCache: DocumentCache,
                private languageService: LanguageService,
                private blueprintMapper: BlueprintMapper,
                private mappers: RefMapperBase[]) {
        this.completeContentMap = new Map<string, IValueSet>(
            FtlData.tags.filter((t: XmlTag): t is XmlTag & { contentsValueSet: string } => !!t.contentsValueSet)
                .map(t => [t.name, FtlData.valueSets?.find(set => set.name == t.contentsValueSet)] as const)
                .filter((arr): arr is [string, IValueSet] => !!arr[1])
        );
        //support custom maps, only complete for ship contents when parent is shipOrder
        this.completeContentMap.set('shipOrder>ship', ShipNames);
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
        let results = this.tryCompleteNodContents(node, offset);
        if (results) return results;

        if (node.parent && this.blueprintMapper.parser.isListChild(node) && this.shouldCompleteForNodeContents(node, offset)) {
            let blueprintListNode = node.parent;
            let typeInfo = this.blueprintMapper.getListTypeInfoFromNode(blueprintListNode, document);
            if (!typeInfo) return;
            let mapper = this.blueprintMapper.getMapperForTypeName(typeInfo.listTypeName);

            if (!mapper || mapper == this.blueprintMapper || !mapper.autoCompleteValues) {
                return this.blueprintMapper.getAllBlueprintNames()
                    .map(name => ({label: name, kind: CompletionItemKind.Unit}));
            } else {
                return this.valueSetToCompletionItems(mapper.autoCompleteValues);
            }
        }
    }

    private tryCompleteNodContents(node: Node, offset: number): CompletionItem[] | undefined {
        if (!node.tag || !this.shouldCompleteForNodeContents(node, offset)) return;
        let valueSet = this.completeContentMap.get(node.tag);
        if (!valueSet && node.parent?.tag) valueSet = this.completeContentMap.get(`${node.parent.tag}>${node.tag}`);
        if (!valueSet) return;
        return this.valueSetToCompletionItems(valueSet);
    }

    private valueSetToCompletionItems(valueSet: IValueSet): CompletionItem[] {
        return valueSet.values.map(value => {
            let strDes: string | undefined = typeof value.description === 'string' ? value.description : value.description?.value;
            return {
                label: {label: value.name, description: strDes},
                kind: CompletionItemKind.Unit,
                documentation: convertDocumentation(value.description)
            };
        });
    }

    private shouldCompleteForNodeContents(node: Node, offset: number) {
        let startTagEnd = node.startTagEnd ?? node.start;
        let endTagStart = node.endTagStart ?? -1;

        return startTagEnd <= offset && endTagStart >= offset;

    }
}
