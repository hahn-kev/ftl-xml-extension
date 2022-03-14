import {FtlXmlParser, ParseContext} from './ftl-xml-parser';
import {FtlData} from '../data/ftl-data';
import {DiagnosticBuilder} from '../diagnostic-builder';
import {XmlTag} from '../data/xml-data/helpers';

export class RequiredChildrenParser implements FtlXmlParser {
  requiredChildrenMap: Map<string, XmlTag> = new Map(FtlData.tags
      .filter((tag: XmlTag) => !!tag.requiredTags)
      .map((tag) => [tag.name, tag]));

  parseNode(context: ParseContext): void {
    if (!context.node.tag || context.isModNode) return;
    const xmlTag = this.requiredChildrenMap.get(context.node.tag);
    const requiredChildren = xmlTag?.requiredTagsByParent?.[context.node.parent?.tag ?? ''] ?? xmlTag?.requiredTags;
    if (requiredChildren === undefined || requiredChildren.length < 1) return;

    const childNames = new Set(context.node.children
        .map((c) => c.tag)
        .filter((t: string | undefined): t is string => !!t));
    const errors = requiredChildren.filter((requiredTagName) => !childNames.has(requiredTagName))
        .map((requiredTagName) => DiagnosticBuilder.missingRequiredChild(context.node, requiredTagName, context.document));
    context.file.diagnostics.push(...errors);
  }
}
