import {DocumentCache} from './document-cache';
import {FtlFile} from './models/ftl-file';
import {
    Diagnostic,
    DiagnosticCollection,
    DiagnosticSeverity,
    Event,
    TextDocument, Uri
} from 'vscode';
import {Node} from 'vscode-html-languageservice';
import {toRange} from './helpers';
import {BlueprintMapper} from './ref-mappers/blueprint-mapper';
import {RefMapperBase} from './ref-mappers/ref-mapper';

export class FltDocumentValidator {

    constructor(private documentCache: DocumentCache,
                private diagnosticCollection: DiagnosticCollection,
                private blueprintMapper: BlueprintMapper,
                private mappers: RefMapperBase[]) {
    }

    validateDocument(document: TextDocument) {
        let htmlDocument = this.documentCache.getHtmlDocument(document);
        let diagnostics: Diagnostic[] = [];
        this.validateNodes(htmlDocument.roots, diagnostics, document);
        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    validateNodes(nodes: Node[], diagnostics: Diagnostic[], document: TextDocument) {
        for (let node of nodes) {
            this.validateNode(node, diagnostics, document);
            this.validateNodes(node.children, diagnostics, document);
        }
    }


    private validateNode(node: Node, diagnostics: Diagnostic[], document: TextDocument) {

        for (let mapper of this.mappers) {
            let invalidRef = mapper.tryGetInvalidRefName(node, document);
            if (invalidRef) {
                diagnostics.push(new Diagnostic(
                    invalidRef.range,
                    `Invalid ${invalidRef.typeName} name: '${invalidRef.name}'`,
                    DiagnosticSeverity.Warning
                ));
            }
        }

        diagnostics.push(...this.blueprintMapper.validateListType(node, document));
        diagnostics.push(...this.blueprintMapper.validateRefType(node, document));

        if (node.tag && this.isMissingEnd(node, document)) {
            let warningStart = node.endTagStart ?? node.start;
            //when the end and startTagEnd are the same then it's self closing
            let isSelfClosing = node.end == node.startTagEnd;
            let extraForOpening = isSelfClosing || !node.endTagStart ? '<'.length : '</'.length;
            let warningEnd = warningStart + node.tag.length + extraForOpening;

            diagnostics.push(new Diagnostic(
                toRange(warningStart, warningEnd, document),
                `Tag '${node.tag}' is not properly closed`,
                DiagnosticSeverity.Warning
            ));
        }
    }

    isMissingEnd(node: Node, document: TextDocument) {
        return document.getText(toRange(node.end - 1, node.end, document)) !== '>';
    }
}
