import {DocumentCache} from './document-cache';
import {Diagnostic, DiagnosticCollection, DiagnosticSeverity, TextDocument} from 'vscode';
import {Node} from 'vscode-html-languageservice';
import {toRange} from './helpers';
import {BlueprintMapper} from './ref-mappers/blueprint-mapper';
import {RefMapperBase} from './ref-mappers/ref-mapper';
import {FtlData, XmlTag} from './data/ftl-data';
import {FtlParser} from './ftl-parser';
import {FtlFile} from './models/ftl-file';

export class FltDocumentValidator {

    constructor(private documentCache: DocumentCache,
                private diagnosticCollection: DiagnosticCollection,
                private blueprintMapper: BlueprintMapper,
                private mappers: RefMapperBase[],
                private parser: FtlParser) {
    }

    async validateDocument(document: TextDocument) {
        let files = await this.parser.files;
        let file = files.get(document.uri.toString());
        let diagnostics: Diagnostic[] = [];
        if (file) this.validateFile(file, diagnostics);
        let htmlDocument = this.documentCache.getHtmlDocument(document);
        this.validateNodes(htmlDocument.roots, diagnostics, document);
        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    validateFile(file: FtlFile, diagnostics: Diagnostic[]) {
        diagnostics.push(...file.diagnostics);
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

        // this.validateAllowedChildren(node, document, diagnostics);
        this.validateRequiredChildren(node, document, diagnostics);
        let listRefLoop = this.blueprintMapper.validateListRefLoop(node, document);
        if (listRefLoop) {
            diagnostics.push(listRefLoop)
        } else {
            diagnostics.push(...this.blueprintMapper.validateListType(node, document));
        }
        let refTypeDiagnostic = this.blueprintMapper.validateRefType(node, document);
        if (refTypeDiagnostic)
            diagnostics.push(refTypeDiagnostic);


    }

    allowedChildrenMap: Map<string, Set<string>> = new Map(FtlData.tags.map((tag: XmlTag) => [tag.name, new Set(tag.tags)]));

    private validateAllowedChildren(node: Node, document: TextDocument, diagnostics: Diagnostic[]) {
        if (!node.tag) return;
        const allowedChildren = this.allowedChildrenMap.get(node.tag);
        if (allowedChildren === undefined) return;
        let errors = node.children.filter(child => child.tag && !allowedChildren.has(child.tag))
            .map(child => {
                let range = toRange(child.start, child.startTagEnd ?? child.end, document);
                return new Diagnostic(range,
                                      `Tag: ${child.tag} is not allowed in a ${node.tag}`,
                                      DiagnosticSeverity.Warning);
            });
        diagnostics.push(...errors);
    }

    requiredChildrenMap: Map<string, XmlTag> = new Map(FtlData.tags
                                                             .filter((tag: XmlTag): tag is XmlTag & { requiredTags: string[] } => !!tag.requiredTags)
                                                             .map(tag => [tag.name, tag]));

    private validateRequiredChildren(node: Node, document: TextDocument, diagnostics: Diagnostic[]) {
        if (!node.tag) return;
        const xmlTag = this.requiredChildrenMap.get(node.tag);

        let requiredChildren = xmlTag?.requiredTagsByParent?.[node.parent?.tag ?? ''] ?? xmlTag?.requiredTags;
        if (requiredChildren === undefined || requiredChildren.length < 1) return;
        let childNames = new Set(node.children.map(c => c.tag).filter((t: string | undefined): t is string => !!t));
        let errors = requiredChildren.filter(requiredTagName => !childNames.has(requiredTagName))
            .map(requiredTagName => {
                let range = toRange(node.start, node.startTagEnd ?? node.end, document);
                return new Diagnostic(range,
                                      `Tag: ${node.tag} is missing the required child: ${requiredTagName}`,
                                      DiagnosticSeverity.Warning);
            });
        diagnostics.push(...errors);
    }

    isMissingEnd(node: Node, document: TextDocument) {
        return document.getText(toRange(node.end - 1, node.end, document)) !== '>';
    }
}
