import {DocumentCache} from './document-cache';
import {FtlFile} from './ftl-file';
import {
    Diagnostic,
    DiagnosticCollection,
    DiagnosticSeverity,
    languages,
    Range,
    TextDocument
} from 'vscode';
import {Node} from 'vscode-html-languageservice';
import {getLoadEventName, isLoadEvent, normalizeEventName} from './helpers';

export class FltDocumentValidator {
    diagnosticCollection: DiagnosticCollection;

    constructor(private documentCache: DocumentCache) {
        this.diagnosticCollection = languages.createDiagnosticCollection('ftl-xml');
    }

    eventNames = new Set<string>();

    loadEventNames(files: Map<string, FtlFile>) {
        this.eventNames = new Set(Array.from(files.values()).flatMap(value => value.events).map(event => event.name));
    }

    validateDocument(document: TextDocument) {
        if (this.eventNames.size == 0) return;
        let htmlDocument = this.documentCache.getHtmlDocument(document);
        let diagnostics: Diagnostic[] = [];
        this.validateNodes(htmlDocument.roots, diagnostics, document);
        this.diagnosticCollection.set(document.uri, diagnostics)
    }

    validateNodes(nodes: Node[], diagnostics: Diagnostic[], document: TextDocument) {
        for (let node of nodes) {
            this.validateNode(node, diagnostics, document);
            this.validateNodes(node.children, diagnostics, document);
        }
    }

    private validateNode(node: Node, diagnostics: Diagnostic[], document: TextDocument) {
        let eventName: string;
        if (node.tag == "event" && node.attributes && 'load' in node.attributes) {
            eventName = normalizeEventName(node.attributes.load);

        }
        if (isLoadEvent(node)) {
            eventName = getLoadEventName(node, document);
        }
        if (eventName) {
            if (!this.eventNames.has(eventName)) {
                let range = new Range(document.positionAt(node.start), document.positionAt(node.end));
                diagnostics.push(new Diagnostic(range, `Invalid Event name: '${eventName}'`, DiagnosticSeverity.Warning));
            }
        }
    }
}
