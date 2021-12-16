import {
  CancellationToken,
  Definition,
  DefinitionLink,
  DefinitionProvider,
  Location,
  Position,
  ProviderResult,
  Range,
  TextDocument
} from 'vscode';
import {DocumentCache} from '../document-cache';
import {RefProvider} from '../ref-mappers/ref-mapper';

export class FtlDefinitionProvider implements DefinitionProvider {
  constructor(
      private documentCache: DocumentCache,
      private lookupDefProviders: RefProvider[]) {

  }

  provideDefinition(
      document: TextDocument,
      position: Position,
      token: CancellationToken): ProviderResult<Definition | DefinitionLink[]> {
    const htmlDocument = this.documentCache.getHtmlDocument(document);
    const offset = document.offsetAt(position);
    const node = htmlDocument.findNodeBefore(offset);
    for (const lookupDefProvider of this.lookupDefProviders) {
      const def = lookupDefProvider.lookupDef(node, document, position);
      if (def) return def;
    }
  }
}
