import {FtlXmlParser, ParseContext} from './ftl-xml-parser';
import {Node} from 'vscode-html-languageservice';
import {FtlFile} from '../models/ftl-file';
import {TextDocument} from 'vscode';
import {FtlData} from '../data/ftl-data';
import {XmlTag} from '../data/xml-data/helpers';

export class AllowedChildrenParser implements FtlXmlParser {
  allowedChildrenMap: Map<string, Set<string>> = new Map(FtlData.tags.map((tag: XmlTag) => [tag.name, new Set(tag.tags)]));

  parseNode(context: ParseContext): void {
    // disabled for now because it gives way too many errors
    return;
    // if (!node.tag) return;
    // const allowedChildren = this.allowedChildrenMap.get(node.tag);
    // if (allowedChildren === undefined) return;
    // let errors = node.children.filter(child => child.tag && !allowedChildren.has(child.tag))
    //     .map(child => {
    //         return DiagnosticBuilder.childTagNotAllowed(node, child, document);
    //     });
    // file.diagnostics.push(...errors);
  }
}
