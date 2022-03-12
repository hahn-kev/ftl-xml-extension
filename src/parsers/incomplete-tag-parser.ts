import {FtlXmlParser, ParseContext} from './ftl-xml-parser';
import {Node} from 'vscode-html-languageservice';
import {FtlTextDocument} from '../models/ftl-text-document';
import {getText, toRange} from '../helpers';
import {DiagnosticBuilder} from '../diagnostic-builder';

export class IncompleteTagParser implements FtlXmlParser {
  parseNode({node, file, document}: ParseContext): void {
    if (node.tag && this.isMissingEnd(node, document)) {
      const warningStart = node.endTagStart ?? node.start;
      // when the end and startTagEnd are the same then it's self closing
      const isSelfClosing = node.end == node.startTagEnd;
      const extraForOpening = isSelfClosing || !node.endTagStart ? '<'.length : '</'.length;
      const warningEnd = warningStart + node.tag.length + extraForOpening;

      file.diagnostics.push(DiagnosticBuilder.tagNotClosed(toRange(warningStart, warningEnd, document),
          node.tag));
    }
  }

  isMissingEnd(node: Node, document: FtlTextDocument) {
    return getText(node.end - 1, node.end, document) !== '>';
  }
}
