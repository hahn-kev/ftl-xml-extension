import {
  CancellationToken,
  DocumentFormattingEditProvider, DocumentRangeFormattingEditProvider,
  FormattingOptions,
  ProviderResult, Range,
  TextDocument, TextEdit
} from 'vscode';
import {HTMLFormatConfiguration, LanguageService} from 'vscode-html-languageservice';
import {VscodeConverter} from '../vscode-converter';

export class FtlFormattingProvider implements DocumentFormattingEditProvider, DocumentRangeFormattingEditProvider {
  config: HTMLFormatConfiguration = {
    indentInnerHtml: true,
    tabSize: 4,
    templating: false,
    wrapAttributes: 'preserve',
    contentUnformatted: 'text',
    wrapLineLength: 0
  };

  constructor(private htmlService: LanguageService) {
  }

  public provideDocumentFormattingEdits(
      document: TextDocument,
      options: FormattingOptions,
      token: CancellationToken): ProviderResult<TextEdit[]> {
    return this.htmlService.format(VscodeConverter.toTextDocumentHtml(document), undefined, this.config)
        .map(te => VscodeConverter.toVscodeTextEdit(te));
  }

  public provideDocumentRangeFormattingEdits(
      document: TextDocument,
      range: Range,
      options: FormattingOptions,
      token: CancellationToken): ProviderResult<TextEdit[]> {
    return this.htmlService.format(VscodeConverter.toTextDocumentHtml(document), range, this.config)
        .map(te => VscodeConverter.toVscodeTextEdit(te));
  }
}
