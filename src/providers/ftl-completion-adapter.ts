import {
  CancellationToken,
  CompletionContext, CompletionItem,
  CompletionItemProvider, CompletionList,
  Position,
  ProviderResult,
  TextDocument
} from 'vscode';
import {FtlCompletionProvider} from './ftl-completion-provider';
import {DocumentCache} from '../document-cache';
import {LanguageService} from 'vscode-html-languageservice';
import {BlueprintMapper} from '../blueprints/blueprint-mapper';
import {VscodeConverter} from '../vscode-converter';

export class FtlCompletionAdapter implements CompletionItemProvider {
  provider: FtlCompletionProvider;

  constructor(
      documentCache: DocumentCache,
      languageService: LanguageService,
      blueprintMapper: BlueprintMapper) {
    this.provider = new FtlCompletionProvider(documentCache, languageService, blueprintMapper);
  }

  public provideCompletionItems(
      document: TextDocument,
      position: Position,
      token: CancellationToken,
      context: CompletionContext): ProviderResult<CompletionItem[] | CompletionList<CompletionItem>> {
    const htmlTextDocument = VscodeConverter.toTextDocumentHtml(document);
    return VscodeConverter.toVsCodeCompletionItems(this.provider.provideCompletionItems(htmlTextDocument, position));
  }
}
