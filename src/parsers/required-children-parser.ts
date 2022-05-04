import {FtlXmlParser, ParseContext} from './ftl-xml-parser';
import {FtlData} from '../data/ftl-data';
import {DiagnosticBuilder} from '../diagnostic-builder';
import {XmlTag} from '../data/xml-data/helpers';
import {Node} from 'vscode-html-languageservice';

export class RequiredChildrenParser implements FtlXmlParser {
  private enableRequiredChildren = new Set<string>(['choice', 'event']);
  private requiredChildrenMap: Map<string, XmlTag> = new Map(FtlData.tags
      .filter((tag: XmlTag) => !!tag.requiredTags && this.enableRequiredChildren.has(tag.name))
      .map((tag) => [tag.name, tag]));

  parseNode(context: ParseContext): void {
    if (context.isModNode) return;
    const missingChildren = this.missingChildren(context.node);
    if (!missingChildren) return;

    const errors = missingChildren.map((requiredTagName) => DiagnosticBuilder.missingRequiredChild(context.node,
        requiredTagName,
        context.document));
    context.file.diagnostics.push(...errors);
  }

  public missingChildren(node: Node): string[] | undefined {
    if (!node.tag) return;
    const xmlTag = this.requiredChildrenMap.get(node.tag);
    const requiredChildren = xmlTag?.requiredTagsByParent?.[node.parent?.tag ?? ''] ?? xmlTag?.requiredTags;
    if (requiredChildren === undefined || requiredChildren.length < 1) return;

    const childNames = new Set(node.children
        .map((c) => c.tag)
        .filter((t: string | undefined): t is string => !!t));
    return requiredChildren.filter((requiredTagName) => !childNames.has(requiredTagName));
  }
}
