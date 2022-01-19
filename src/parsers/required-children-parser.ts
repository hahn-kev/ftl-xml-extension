import {FtlXmlParser, ParseContext} from './ftl-xml-parser';
import {FtlData} from '../data/ftl-data';
import {DiagnosticBuilder} from '../diagnostic-builder';
import {XmlTag} from '../data/xml-data/helpers';

export class RequiredChildrenParser implements FtlXmlParser {
  requiredChildrenMap: Map<string, XmlTag> = new Map(FtlData.tags
      .filter((tag: XmlTag) => !!tag.requiredTags)
      .map((tag) => [tag.name, tag]));

  parseNode({node, file, document}: ParseContext): void {
    if (!node.tag) return;
    const xmlTag = this.requiredChildrenMap.get(node.tag);
    const requiredChildren = xmlTag?.requiredTagsByParent?.[node.parent?.tag ?? ''] ?? xmlTag?.requiredTags;
    if (requiredChildren === undefined || requiredChildren.length < 1) return;

    const childNames = new Set(node.children.map((c) => c.tag).filter((t: string | undefined): t is string => !!t));
    const errors = requiredChildren.filter((requiredTagName) => !childNames.has(requiredTagName))
        .map((requiredTagName) => DiagnosticBuilder.missingRequiredChild(node, requiredTagName, document));
    file.diagnostics.push(...errors);
  }
}
