import {FtlXmlParser} from './ftl-xml-parser';
import {Node} from 'vscode-html-languageservice';
import {FtlFile} from '../models/ftl-file';
import {Diagnostic, DiagnosticSeverity, TextDocument} from 'vscode';
import {toRange} from '../helpers';

export class IncompleteTagParser implements FtlXmlParser {
    parseNode(node: Node, file: FtlFile, document: TextDocument): void {
        if (node.tag && this.isMissingEnd(node, document)) {
            let warningStart = node.endTagStart ?? node.start;
            //when the end and startTagEnd are the same then it's self closing
            let isSelfClosing = node.end == node.startTagEnd;
            let extraForOpening = isSelfClosing || !node.endTagStart ? '<'.length : '</'.length;
            let warningEnd = warningStart + node.tag.length + extraForOpening;

            file.diagnostics.push(new Diagnostic(
                toRange(warningStart, warningEnd, document),
                `Tag '${node.tag}' is not properly closed`,
                DiagnosticSeverity.Error
            ));
        }
    }

    isMissingEnd(node: Node, document: TextDocument) {
        return document.getText(toRange(node.end - 1, node.end, document)) !== '>';
    }

}
