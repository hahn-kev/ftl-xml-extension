import {
  CompletionItem, CompletionItemKind,
  HTMLDocument,
  IValueData,
  IValueSet,
  LanguageService,
  Node
} from 'vscode-html-languageservice';
import {isInAttrValue, normalizeTagName, shouldCompleteForNodeContents, toRange} from '../helpers';
import {DocumentCache} from '../document-cache';
import {BlueprintMapper} from '../blueprints/blueprint-mapper';
import {FtlData} from '../data/ftl-data';
import {SoundWavePaths} from '../data/autocomplete-value-sets';
import {Sounds} from '../sounds';
import {ConfigOverride} from '../data/config-override';
import {FtlTextDocument} from '../models/ftl-text-document';
import {Position, Range, TextDocument} from 'vscode-languageserver-textdocument';

export class FtlCompletionProvider {
  private valueSetMap: Map<string, IValueSet>;

  constructor(private documentCache: DocumentCache,
              private languageService: LanguageService,
              private blueprintMapper: BlueprintMapper) {
    this.valueSetMap = new Map<string, IValueSet>(FtlData.valueSets?.map(set => [set.name, set]) ?? []);
  }


  public provideCompletionItems(document: FtlTextDocument, position: Position): CompletionItem[] {
    const htmlDocument = this.documentCache.getHtmlDocument(document);

    const items = this.tryCompleteCustom(document, htmlDocument, position);
    if (items) return items;

    const completionItems = this.languageService.doComplete(
        TextDocument.create(document.uri.toString(), document.languageId, document.version, document.getText()),
        position,
        htmlDocument,
        {attributeDefaultValue: 'doublequotes'}
    );
    return completionItems.items;
  }

  private tryCompleteCustom(
      document: FtlTextDocument,
      htmlDocument: HTMLDocument,
      position: Position): CompletionItem[] | undefined {
    const offset = document.offsetAt(position);
    const node = htmlDocument.findNodeBefore(offset);
    let results = this.tryCompleteNodeContents(node, document, offset);
    if (results) return results;
    results = this.tryCompleteModAppend(node, document, offset);
    if (results) return results;

    if (node.parent
        && this.blueprintMapper.parser.isListChild(node)
        && shouldCompleteForNodeContents(node, offset)) {
      const range = toRange(node.startTagEnd, node.endTagStart, document);
      const blueprintListNode = node.parent;
      const listName = this.blueprintMapper.parser.getNameDef({node: blueprintListNode, document});
      if (!listName) return;
      const typeName = this.blueprintMapper.getRefType(listName.name);
      const mapper = this.blueprintMapper.getMapperForTypeName(typeName);

      if (!mapper || mapper == this.blueprintMapper || !mapper.autoCompleteValues) {
        return this.blueprintMapper.getAllBlueprintNames()
            .map((name) => ({label: name, kind: CompletionItemKind.Unit, range}));
      } else {
        return this.valueSetToCompletionItems(mapper.autoCompleteValues, range);
      }
    }
    if (isInAttrValue(node, document, 'req', position)) {
      return this.blueprintMapper.getAllBlueprintNames().map((name) => ({label: name, kind: CompletionItemKind.Unit}));
    }
  }

  private tryCompleteNodeContents(node: Node, document: FtlTextDocument, offset: number): CompletionItem[] | undefined {
    if (!node.tag || !shouldCompleteForNodeContents(node, offset)) return;
    const range = toRange(node.startTagEnd, node.endTagStart, document);

    if (Sounds.isWaveNode(node, document)) {
      return this.valueSetToCompletionItems(SoundWavePaths, range);
    }

    const tagName = normalizeTagName(node.tag);
    const xmlTag = ConfigOverride.getActualConfig(FtlData.tagMap.get(tagName), node);
    if (!xmlTag || !xmlTag.contentsValueSet) return;
    const valueSet = this.valueSetMap.get(xmlTag.contentsValueSet);
    if (!valueSet) return;

    return this.valueSetToCompletionItems(valueSet, range);
  }

  private tryCompleteModAppend(node: Node, document: FtlTextDocument, offset: number): CompletionItem[] | undefined {
    if (node.tag != 'mod-append:' && node.tag != 'mod-overwrite:') return;
    if (node.start + node.tag.length != (offset - 1)) return;
    const range = toRange(offset, offset, document);
    return this.valueDataToCompletionItems(FtlData.tags, range);
  }

  private valueSetToCompletionItems(valueSet: IValueSet, range: Range): CompletionItem[] {
    return this.valueDataToCompletionItems(valueSet.values, range);
  }

  private valueDataToCompletionItems(valueData: IValueData[], range: Range): CompletionItem[] {
    return valueData.map((value) => {
      const strDes = typeof value.description === 'string' ? value.description : value.description?.value;
      return {
        label: value.name,
        kind: CompletionItemKind.Unit,
        documentation: value.description,
        range: range,
        detail: strDes
      };
    });
  }
}
