import {
  CancellationToken,
  Definition,
  DefinitionLink,
  DefinitionProvider, Location,
  Position,
  ProviderResult, Range,
  TextDocument
} from 'vscode';
import {DocumentCache} from '../document-cache';
import {RefMapperBase} from '../ref-mappers/ref-mapper';
import {FtlCompletionProvider} from './ftl-completion-provider';
import {getNodeTextContent} from '../helpers';
import {FtlParser} from '../ftl-parser';

export class FtlDefinitionProvider implements DefinitionProvider {
  constructor(private documentCache: DocumentCache, private mappers: RefMapperBase[], private ftlParser: FtlParser) {

  }

  provideDefinition(
      document: TextDocument,
      position: Position,
      token: CancellationToken): ProviderResult<Definition | DefinitionLink[]> {
    const htmlDocument = this.documentCache.getHtmlDocument(document);
    const offset = document.offsetAt(position);
    const node = htmlDocument.findNodeBefore(offset);
    for (const mapper of this.mappers) {
      const def = mapper.lookupDef(node, document, position);
      if (def) return def;
    }
    if ((node.tag == 'animSheet' || node.tag == 'img' || node.tag == 'chargeImage')
        && FtlCompletionProvider.shouldCompleteForNodeContents(node, offset)) {
      const imgPathName = getNodeTextContent(node, document);
      if (!imgPathName) return;
      const img = this.ftlParser.root.findMatchingImg(imgPathName);
      if (!img) return;
      return new Location(img.uri, new Range(0, 0, 0, 0));
    }
  }
}
