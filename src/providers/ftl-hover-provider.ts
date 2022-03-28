import {CancellationToken, Hover, HoverProvider, MarkdownString, Position, TextDocument, Uri, workspace} from 'vscode';
import {DocumentCache} from '../document-cache';
import {HTMLDocument, LanguageService, Node, TextDocument as HtmlTextDocument} from 'vscode-html-languageservice';
import {attrNameRange, nodeTagEq, toRange, transformModFindNode} from '../helpers';
import {Mappers} from '../ref-mappers/mappers';
import {PathRefMappers} from '../ref-mappers/path-ref-mapper';
import {FtlDatFs} from '../dat-fs-provider/ftl-dat-fs';
import {LookupContext} from '../ref-mappers/lookup-provider';
import {VscodeConverter} from '../vscode-converter';
import {AnimationPreview} from '../animation-preview/animation-preview';

export class FtlHoverProvider implements HoverProvider {
  constructor(private documentCache: DocumentCache,
              private service: LanguageService,
              private mappers: Mappers,
              private pathMappers: PathRefMappers) {

  }

  async provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover | undefined> {
    let htmlDocument = this.documentCache.getHtmlDocument(document);

    let node: Node;
    const originalNode = node = htmlDocument.findNodeAt(document.offsetAt(position));
    const findNode = transformModFindNode(node);
    let isModNode = false;
    if (findNode) {
      node = findNode;
      isModNode = true;
    }

    const context: LookupContext = {node, document, position};
    const hoverTextId = this.tryHoverTextId(context);
    if (hoverTextId) return hoverTextId;
    const hoverImg = await this.tryHoverImagePath(context);
    if (hoverImg) return hoverImg;
    const animHover = this.tryHoverAnimation(context);
    if (animHover) return animHover;

    // the document from vscode will not accept range objects created inside
    // the html language service, so we must do this
    const textDocument = HtmlTextDocument.create(document.uri.toString(),
        document.languageId,
        document.version,
        document.getText());

    if (isModNode) {
      htmlDocument = this.patchTransformedFindNodeIntoHtml(node, originalNode, htmlDocument);
    }

    const hover = this.service.doHover(textDocument,
        position,
        htmlDocument,
        {documentation: true});
    if (!hover || !hover.range || hover.contents === '') return;
    let documentation: string | MarkdownString | undefined;
    if (typeof hover.contents === 'object' && 'kind' in hover.contents) {
      documentation = VscodeConverter.toDocumentation(hover.contents);
    }
    if (!documentation) return;
    return {
      range: VscodeConverter.toVscodeRange(hover.range),
      contents: [documentation]
    };
  }

  patchTransformedFindNodeIntoHtml(transformedNode: Node, originalNode: Node, currentDoc: HTMLDocument): HTMLDocument {
    function parentList(n: Node): Node[] {
      const parent = n.parent;
      if (parent) {
        const result = parentList(parent);
        result.push(parent);
        return result;
      }
      return [];
    }

    const roots = [...currentDoc.roots];
    const list = parentList(originalNode);
    let previous: Node | undefined = undefined;

    for (const node of list) {
      const newNode: Node = {
        ...node,
        parent: previous,
        attributes: {...node.attributes},
        children: [...node.children]
      };
      if (previous) {
        previous.children[previous.children.indexOf(node)] = newNode;
      }
      if (roots.includes(node)) {
        roots[roots.indexOf(node)] = newNode;
      }
      previous = newNode;
    }
    if (previous) {
      previous.children[previous.children.indexOf(originalNode)] = transformedNode;
    }

    return {...currentDoc, roots};
  }

  tryHoverTextId({node, document, position}: LookupContext): Hover | undefined {
    const textIdName = this.mappers.textMapper.parser.getRefName(node, document, position);
    if (!textIdName) return;

    const textDef = this.mappers.textMapper.defs.get(textIdName);
    if (!textDef || !textDef.text) return;
    let idStart: number;
    let idEnd: number;
    // this tag has the id as the contents
    if (nodeTagEq(node, 'tip')) {
      idStart = node.startTagEnd ?? node.start;
      idEnd = node.endTagStart ?? node.end;
    } else {
      const nameRange = attrNameRange(node, document, position);
      if (!nameRange) return;
      idStart = nameRange.endOffset + '="'.length;
      idEnd = idStart + textIdName.length;
    }

    return new Hover(
        [textDef.text],
        VscodeConverter.toVscodeRange(toRange(idStart, idEnd, document))
    );
  }

  tryHoverAnimation(context: LookupContext): Hover | undefined {
    const name = this.mappers.animationMapper.parser.getNameDef(context)
        ?? this.mappers.animationMapper.parser.getRefName(context.node, context.document, context.position);
    if (!name) return;

    const component = encodeURIComponent(JSON.stringify([name]));
    const showPreviewCommand = Uri.parse(`command:${AnimationPreview.OpenPreviewCommand}?${component}`);
    const mdString = new MarkdownString(`[Click to Preview Animation](${showPreviewCommand})`);
    mdString.isTrusted = true;
    return new Hover(mdString);
  }


  async tryHoverImagePath({node, document, position}: LookupContext): Promise<Hover | undefined> {
    const img = this.pathMappers.imageMapper.lookupFile({node, document, position});
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
        VscodeConverter.toVscodeRange(toRange(node.startTagEnd ?? node.start, node.endTagStart ?? node.end, document))
    );
  }
}
