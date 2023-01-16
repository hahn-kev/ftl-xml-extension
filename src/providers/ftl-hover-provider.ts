import {CancellationToken, Hover, HoverProvider, MarkdownString, Position, TextDocument, Uri, workspace} from 'vscode';
import {DocumentCache} from '../document-cache';
import {
  HTMLDocument,
  LanguageService,
  Location,
  Node,
  Range,
  TextDocument as HtmlTextDocument
} from 'vscode-html-languageservice';
import {copyNode, filterValueNameToPosition, toRange, transformModNode} from '../helpers';
import {Mappers} from '../ref-mappers/mappers';
import {PathRefMappers} from '../ref-mappers/path-ref-mapper';
import {FtlDatFs} from '../dat-fs-provider/ftl-dat-fs';
import {LookupContext} from '../ref-mappers/lookup-provider';
import {VscodeConverter} from '../vscode-converter';
import {AnimationPreview} from '../animation-preview/animation-preview';
import {FtlData} from '../data/ftl-data';
import { URI } from 'vscode-uri';
import { FtlResourceFile } from '../models/ftl-resource-file';
import { ValueName } from '../ref-mappers/value-name';

export class FtlHoverProvider implements HoverProvider {
  constructor(private documentCache: DocumentCache,
              private service: LanguageService,
              private mappers: Mappers,
              private pathMappers: PathRefMappers) {

  }

  async provideHover(document: TextDocument, position: Position, token: CancellationToken): Promise<Hover | undefined> {
    const htmlDocument = this.documentCache.getHtmlDocument(document);

    let node: Node;
    const originalNode = node = htmlDocument.findNodeAt(document.offsetAt(position));
    const modNode = transformModNode(node);
    let isModNode = false;
    if (modNode) {
      node = modNode;
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


    const hover = this.doHover(textDocument, position, htmlDocument);
    const contents: Array<string | MarkdownString> = [];
    let range: Range | undefined = undefined;
    if (hover) {
      contents.push(hover.documentation);
      range = hover.range;
    }
    if (isModNode) {
      const hover = this.doHover(
          textDocument,
          position,
          this.patchTransformedFindNodeIntoHtml(node, originalNode, htmlDocument)
      );
      if (hover) {
        contents.push(hover?.documentation);
        range ??= hover.range;
      }
    }

    if (node.tag && originalNode.tag?.startsWith('mod-') && isModNode) {
      const modTagName = originalNode.tag.slice(0, -node.tag.length);
      const tag = FtlData.tagMap.get(modTagName);
      if (tag && tag.description) {
        contents.push(VscodeConverter.toDocumentation(tag.description));
        range ??= toRange(originalNode.start + 1, originalNode.start + 1 + originalNode.tag.length, document);
      }
    }

    if (!range) return;
    return {
      range: VscodeConverter.toVscodeRange(range),
      contents
    };
  }

  private doHover(doc: HtmlTextDocument, position: Position, htmlDoc: HTMLDocument)
    : {range: Range, documentation: MarkdownString | string}|undefined {
    const hover = this.service.doHover(doc,
        position,
        htmlDoc,
        {documentation: true});
    if (!hover || !hover.range || hover.contents === '') return;
    let documentation: string | MarkdownString | undefined;
    if (typeof hover.contents === 'object' && 'kind' in hover.contents) {
      documentation = VscodeConverter.toDocumentation(hover.contents);
    }
    if (!documentation) return;
    return {range: hover.range, documentation};
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

    const list = parentList(originalNode);
    let previous: Node | undefined = undefined;
    let root: Node | undefined = undefined;

    for (const node of list) {
      const newNode = copyNode(node, {
        parent: previous,
        attributes: {...node.attributes},
        children: [...node.children]
      });
      if (!root) root = newNode;
      if (previous) {
        previous.children[previous.children.indexOf(node)] = newNode;
      }
      previous = newNode;
    }
    if (previous) {
      previous.children[previous.children.indexOf(originalNode)] = transformedNode;
    }
    if (!root) throw new Error('no root element found');
    const nodePrototype = Object.getPrototypeOf(originalNode);
    return {
      roots: root.children,
      findNodeAt: nodePrototype.findNodeAt.bind(root),
      findNodeBefore: nodePrototype.findNodeBefore.bind(root)
    };
  }

  tryHoverTextId(context: LookupContext): Hover | undefined {
    const textIdNameValue = filterValueNameToPosition(this.mappers.textMapper.parser.getRefName(context), context.position);
    if (!textIdNameValue) return;

    const textDef = this.mappers.textMapper.defs.get(textIdNameValue.name);
    if (!textDef || !textDef.text) return;

    return new Hover(
        [textDef.text],
        VscodeConverter.toVscodeRange(textIdNameValue.range)
    );
  }

  tryHoverAnimation(context: LookupContext): Hover | undefined {

    const animation = this.tryGetAnimationForHover(context);
  if (!animation) return;
    const component = encodeURIComponent(JSON.stringify([animation.valueName.name, animation.type]));
    const showPreviewCommand = Uri.parse(`command:${AnimationPreview.OpenPreviewCommand}?${component}`);
    const mdString = new MarkdownString(`[Click to Preview Animation](${showPreviewCommand})`);
    mdString.isTrusted = true;
    return new Hover(mdString, VscodeConverter.toVscodeRange(animation.valueName.range));
  }

  tryGetAnimationForHover(context: LookupContext): { valueName: ValueName, type: 'anim' | 'weaponAnim' } | undefined {
    let refs = this.mappers.animationMapper.parser.getNameDef(context)
        ?? this.mappers.animationMapper.parser.getRefName(context);
    let valueName = filterValueNameToPosition(refs, context.position);
    if (valueName) return {valueName, type: 'anim'};
    refs = this.mappers.weaponAnimationMapper.parser.getNameDef(context)
        ?? this.mappers.weaponAnimationMapper.parser.getRefName(context);
    valueName = filterValueNameToPosition(refs, context.position);
    if (valueName) return {valueName, type: 'weaponAnim'};
    return undefined;
  }


  async tryHoverImagePath(context: LookupContext): Promise<Hover | undefined> {
    let file: FtlResourceFile | undefined = undefined;
    let ref: ValueName | undefined = undefined;
    for (const mapper of this.pathMappers.mappers) {
      ({ file, ref } = mapper.lookupFile(context));
      if (file && file.uri.path.endsWith('.png')) break;
    }
    if (!file || !file.uri.path.endsWith('.png') || !ref) return;
    const uri = file.uri;
    const mdString = new MarkdownString();
    let imageUrl: string;
    if (uri.scheme == 'file') {
      imageUrl = uri.toString();
    } else if (uri.scheme == FtlDatFs.scheme) {
      // markdown in vscode does not support using non file schemes
      // so we need to convert the image into a data uri
      const imgData = await workspace.fs.readFile(uri);
      const base64EncodedImage = Buffer.from(imgData).toString('base64');
      imageUrl = `data:image/png;base64,${base64EncodedImage}`;
    } else {
      return;
    }
    mdString.appendMarkdown(`![img](${imageUrl})`);
    return new Hover(
      mdString,
      VscodeConverter.toVscodeRange(ref.range)
    );
  }
}
