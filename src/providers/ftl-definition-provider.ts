import {
  CancellationToken,
  Definition,
  DefinitionLink,
  DefinitionProvider,
  Position,
  ProviderResult,
  TextDocument
} from 'vscode';
import {DocumentCache} from '../document-cache';
import {RefMapperBase} from '../ref-mappers/ref-mapper';

export class FtlDefinitionProvider implements DefinitionProvider {
  constructor(private documentCache: DocumentCache, private mappers: RefMapperBase[]) {

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
  }
}
