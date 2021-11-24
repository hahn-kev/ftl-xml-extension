import {FtlXmlParser} from './ftl-xml-parser';
import {FtlFile} from '../models/ftl-file';
import {TextDocument} from 'vscode';
import {Node} from 'vscode-html-languageservice';
import {FtlData, XmlTag} from '../data/ftl-data';
import {DiagnosticBuilder} from '../diagnostic-builder';

export class RequiredChildrenParser implements FtlXmlParser {
  requiredChildrenMap: Map<string, XmlTag> = new Map(FtlData.tags
      .filter((tag: XmlTag): tag is XmlTag & { requiredTags: string[] } => !!tag.requiredTags)
      .map((tag) => [tag.name, tag]));

  parseNode(node: Node, file: FtlFile, document: TextDocument): void {
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
