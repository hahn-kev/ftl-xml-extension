import {CancellationToken, Hover, HoverProvider, MarkdownString, Position, ProviderResult, TextDocument} from 'vscode';
import {DocumentCache} from '../document-cache';
import {HTMLDocument, LanguageService, TextDocument as HtmlTextDocument} from 'vscode-html-languageservice';
import {attrNameRange, convertDocumentation, convertRange, toRange} from '../helpers';
import {mappers} from '../ref-mappers/mappers';

export class FtlHoverProvider implements HoverProvider {
  constructor(private documentCache: DocumentCache, private service: LanguageService) {

  }

  provideHover(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Hover> {
    const htmlDocument = this.documentCache.getHtmlDocument(document);
    const hoverTextId = this.tryHoverTextId(htmlDocument, document, position);
    if (hoverTextId) return hoverTextId;
    // the document from vscode will not accept range objects created inside
    // the html language service, so we must do this
    const textDocument = HtmlTextDocument.create(document.uri.toString(),
        document.languageId,
        document.version,
        document.getText());

    const hover = this.service.doHover(textDocument,
        position,
        htmlDocument,
        {documentation: true});
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

  tryHoverTextId(htmlDocument: HTMLDocument, document: TextDocument, position: Position): Hover | undefined {
    const node = htmlDocument.findNodeAt(document.offsetAt(position));
    const textIdName = mappers.textMapper.parser.getRefName(node, document, position);
    if (!textIdName) return;

    const textDef = mappers.textMapper.defs.get(textIdName);
    if (!textDef || !textDef.text) return;

    const nameRange = attrNameRange(node, document, position);
    if (!nameRange) return;
    const idStart = document.offsetAt(nameRange.end) + '="'.length;
    const idEnd = idStart + textIdName.length;
    return {
      range: toRange(idStart, idEnd, document),
      contents: [textDef.text]
    };
  }
}
