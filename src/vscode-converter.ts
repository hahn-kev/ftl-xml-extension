import {
  Location as HtmlLocation,
  MarkupContent,
  Range as HtmlRange,
  TextDocument as HtmlTextDocument,
  CompletionItem as HtmlCompletionItem,
  TextEdit as HtmlTextEdit
} from 'vscode-html-languageservice';
import {
  Diagnostic,
  DiagnosticRelatedInformation,
  Location,
  MarkdownString,
  Position,
  Range, SnippetString,
  TextDocument,
  Uri,
  CompletionItem, TextEdit
} from 'vscode';
import {FtlDiagnostic} from './models/ftl-diagnostic';

export class VscodeConverter {
  static toDocumentation(documentation: string | MarkupContent | undefined): string | MarkdownString | undefined {
    if (typeof documentation === 'object' && 'kind' in documentation) {
      if (documentation.kind == 'markdown') {
        return new MarkdownString(documentation.value);
      }
      return documentation.value;
    }
    return documentation;
  }

  static toTextDocumentHtml(d: TextDocument): HtmlTextDocument {
    return {...d, uri: d.uri.toString()};
  }

  static toVsCodeCompletionItems(items: HtmlCompletionItem[]): CompletionItem[] {
    return items.filter((value) => value.label !== 'data-').map((item) => {
      const {documentation, textEdit, additionalTextEdits, ...rest} = item;
      const result: CompletionItem = {...rest};
      result.documentation = VscodeConverter.toDocumentation(documentation);
      if (textEdit) {
        result.insertText = new SnippetString(textEdit.newText);
        if ('range' in textEdit) {
          result.range = VscodeConverter.toVscodeRange(textEdit.range);
        }
      }
      return result;
    });
  }

  static toVscodeRange(range: HtmlRange): Range {
    const start = range.start;
    const end = range.end;
    return new Range(new Position(start.line, start.character), new Position(end.line, end.character));
  }

  static toVscodeLocation(location: HtmlLocation): Location {
    return new Location(Uri.parse(location.uri), this.toVscodeRange(location.range));
  }

  static toVscodeDiagnostic(diagnostic: FtlDiagnostic): Diagnostic {
    const vscodeDiag = new Diagnostic(this.toVscodeRange(diagnostic.range), diagnostic.message, diagnostic.severity);
    if (diagnostic.code) vscodeDiag.code = diagnostic.code;
    if (diagnostic.source) vscodeDiag.source = diagnostic.source;
    if (diagnostic.relatedInformation) {
      vscodeDiag.relatedInformation = diagnostic.relatedInformation.map((info) => new DiagnosticRelatedInformation(
          this.toVscodeLocation(info.location),
          info.message));
    }
    return vscodeDiag;
  }

  static toVscodeTextEdit(textEdit: HtmlTextEdit): TextEdit {
    return new TextEdit(this.toVscodeRange(textEdit.range), textEdit.newText);
  }
}
