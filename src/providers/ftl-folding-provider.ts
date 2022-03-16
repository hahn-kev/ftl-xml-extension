import {
  CancellationToken,
  FoldingContext,
  FoldingRange,
  FoldingRangeKind,
  FoldingRangeProvider,
  ProviderResult,
  TextDocument
} from 'vscode';
import {FoldingRangeKind as HtmlFoldingRangeKind, LanguageService} from 'vscode-html-languageservice';
import {VscodeConverter} from '../vscode-converter';

export class FtlFoldingProvider implements FoldingRangeProvider {
  constructor(private htmlService: LanguageService) {

  }

  public provideFoldingRanges(
      document: TextDocument,
      context: FoldingContext,
      token: CancellationToken): ProviderResult<FoldingRange[]> {
    const ranges = this.htmlService.getFoldingRanges(VscodeConverter.toTextDocumentHtml(document));

    return ranges.map((r) => {
      let kind: FoldingRangeKind;
      switch (r.kind as HtmlFoldingRangeKind) {
        case HtmlFoldingRangeKind.Comment:
          kind = FoldingRangeKind.Comment;
          break;
        case HtmlFoldingRangeKind.Imports:
          kind = FoldingRangeKind.Imports;
          break;
        case HtmlFoldingRangeKind.Region:
          kind = FoldingRangeKind.Region;
          break;
      }
      return ({start: r.startLine, end: r.endLine, kind: kind});
    });
  }
}
