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
import {LookupProvider} from '../ref-mappers/lookup-provider';
import {VscodeConverter} from '../vscode-converter';

export class FtlDefinitionProvider implements DefinitionProvider {
  constructor(
      private documentCache: DocumentCache,
      private lookupDefProviders: LookupProvider[]) {

  }

  provideDefinition(
      document: TextDocument,
      position: Position,
      token: CancellationToken): ProviderResult<Definition | DefinitionLink[]> {
    const htmlDocument = this.documentCache.getHtmlDocument(document);
    const offset = document.offsetAt(position);
    const node = htmlDocument.findNodeBefore(offset);
    for (const lookupDefProvider of this.lookupDefProviders) {
      const def = lookupDefProvider.lookupDef({node, document, position});
      if (def) return VscodeConverter.toVscodeLocation(def);
    }
  }
}
