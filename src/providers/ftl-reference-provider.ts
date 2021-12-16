import {
  CancellationToken,
  Location,
  Position,
  ProviderResult,
  ReferenceContext,
  ReferenceProvider,
  TextDocument
} from 'vscode';
import {DocumentCache} from '../document-cache';
import {LookupProvider} from '../ref-mappers/lookup-provider';

export class FtlReferenceProvider implements ReferenceProvider {
  constructor(private documentCache: DocumentCache, private refProviders: LookupProvider[]) {
  }

  provideReferences(
      document: TextDocument,
      position: Position,
      context: ReferenceContext,
      token: CancellationToken): ProviderResult<Location[]> {
    const htmlDocument = this.documentCache.getHtmlDocument(document);
    const offset = document.offsetAt(position);
    const node = htmlDocument.findNodeBefore(offset);
    for (const refProvider of this.refProviders) {
      const refs = refProvider.lookupRefs({node, document, position});
      if (refs) return refs;
    }
  }
}
