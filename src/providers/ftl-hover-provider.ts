import {
  CancellationToken,
  Hover,
  HoverProvider,
  MarkdownString,
  Position,
  TextDocument,
  workspace
} from 'vscode';
import {DocumentCache} from '../document-cache';
import {HTMLDocument, LanguageService, Node, TextDocument as HtmlTextDocument} from 'vscode-html-languageservice';
import {attrNameRange, convertDocumentation, convertRange, toRange} from '../helpers';
import {Mappers} from '../ref-mappers/mappers';
import {PathRefMappers} from '../ref-mappers/path-ref-mapper';
import {FtlDatFs} from '../dat-fs-provider/ftl-dat-fs';

export class FtlHoverProvider implements HoverProvider {
  constructor(private documentCache: DocumentCache,
              private service: LanguageService,
              private mappers: Mappers,
              private pathMappers: PathRefMappers) {

  }

  async provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover | undefined> {
    const htmlDocument = this.documentCache.getHtmlDocument(document);
    const node = htmlDocument.findNodeAt(document.offsetAt(position));
    const hoverTextId = this.tryHoverTextId(htmlDocument, document, position, node);
    if (hoverTextId) return hoverTextId;
    const hoverImg = await this.tryHoverImagePath(htmlDocument, document, position, node);
    if (hoverImg) return hoverImg;

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
    if (!hover || !hover.range || hover.contents === '') return;
    let documentation: string | MarkdownString | undefined;
    if (typeof hover.contents === 'object' && 'kind' in hover.contents) {
      documentation = convertDocumentation(hover.contents);
    }
    if (!documentation) return;
    return {
      range: convertRange(hover.range),
      contents: [documentation]
    };
  }

  tryHoverTextId(
      htmlDocument: HTMLDocument,
      document: TextDocument,
      position: Position,
      node: Node): Hover | undefined {
    const textIdName = this.mappers.textMapper.parser.getRefName(node, document, position);
    if (!textIdName) return;

    const textDef = this.mappers.textMapper.defs.get(textIdName);
    if (!textDef || !textDef.text) return;

    const nameRange = attrNameRange(node, document, position);
    if (!nameRange) return;
    const idStart = document.offsetAt(nameRange.end) + '="'.length;
    const idEnd = idStart + textIdName.length;
    return new Hover(
        [textDef.text],
        toRange(idStart, idEnd, document)
    );
  }


  async tryHoverImagePath(
      htmlDocument: HTMLDocument,
      document: TextDocument,
      position: Position,
      node: Node): Promise<Hover | undefined> {
    const img = this.pathMappers.imageMapper.lookupImg({node, document, position});
    if (!img) return;
    const mdString = new MarkdownString();
    let imageUrl: string;
    if (img.uri.scheme == 'file') {
      imageUrl = img.uri.toString();
    } else if (img.uri.scheme == FtlDatFs.scheme) {
      // markdown in vscode does not support using non file schemes
      // so we need to convert the image into a data uri
      const imgData = await workspace.fs.readFile(img.uri);
      const base64EncodedImage = Buffer.from(imgData).toString('base64');
      imageUrl = `data:image/png;base64,${base64EncodedImage}`;
    } else {
      return;
    }
    mdString.appendMarkdown(`![img](${imageUrl})`);
    return new Hover(
        mdString,
        toRange(node.startTagEnd ?? node.start, node.endTagStart ?? node.end, document)
    );
  }
}
