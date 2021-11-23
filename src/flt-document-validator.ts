import {DocumentCache} from './document-cache';
import {Diagnostic, DiagnosticCollection, DiagnosticSeverity, TextDocument} from 'vscode';
import {Node} from 'vscode-html-languageservice';
import {toRange} from './helpers';
import {BlueprintMapper} from './ref-mappers/blueprint-mapper';
import {RefMapperBase} from './ref-mappers/ref-mapper';
import {FtlData, XmlTag} from './data/ftl-data';
import {FtlParser} from './ftl-parser';
import {FtlFile} from './models/ftl-file';
import {Validator} from './validators/validator';
import {DiagnosticBuilder} from './diagnostic-builder';

export class FltDocumentValidator {

    constructor(private documentCache: DocumentCache,
                private diagnosticCollection: DiagnosticCollection,
                private blueprintMapper: BlueprintMapper,
                private mappers: RefMapperBase[],
                private parser: FtlParser,
                private validators: Validator[]) {
    }

    async validateDocument(document: TextDocument) {
        let files = await this.parser.files;
        let file = files.get(document.uri.toString());
        let diagnostics: Diagnostic[] = [];
        if (file) this.validateFile(file, document, diagnostics);
        let htmlDocument = this.documentCache.getHtmlDocument(document);
        this.validateNodes(htmlDocument.roots, diagnostics, document);
        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    validateFile(file: FtlFile, document: TextDocument, diagnostics: Diagnostic[]) {
        diagnostics.push(...file.diagnostics);
        for (let validator of this.validators) {
            validator.validateFile(file, document, diagnostics);
        }
    }

    validateNodes(nodes: Node[], diagnostics: Diagnostic[], document: TextDocument) {
        for (let node of nodes) {
            this.validateNode(node, diagnostics, document);
            this.validateNodes(node.children, diagnostics, document);
        }
    }


    private validateNode(node: Node, diagnostics: Diagnostic[], document: TextDocument) {
        for (let mapper of this.mappers) {
            let invalidRefs = mapper.tryGetInvalidRefName(node, document);
            if (invalidRefs && invalidRefs.length > 0) {
                diagnostics.push(...invalidRefs.map(invalidRef => DiagnosticBuilder.invalidRefName(invalidRef)));
            }
        }

        // this.validateAllowedChildren(node, document, diagnostics);
        this.validateRequiredChildren(node, document, diagnostics);
        let listRefLoop = this.blueprintMapper.validateListRefLoop(node, document);
        if (listRefLoop) {
            diagnostics.push(listRefLoop);
        } else {
            diagnostics.push(...this.blueprintMapper.validateListType(node, document));
        }
       this.blueprintMapper.validateRefType(node, document, diagnostics);
    }

    allowedChildrenMap: Map<string, Set<string>> = new Map(FtlData.tags.map((tag: XmlTag) => [tag.name, new Set(tag.tags)]));

    private validateAllowedChildren(node: Node, document: TextDocument, diagnostics: Diagnostic[]) {
        if (!node.tag) return;
        const allowedChildren = this.allowedChildrenMap.get(node.tag);
        if (allowedChildren === undefined) return;
        let errors = node.children.filter(child => child.tag && !allowedChildren.has(child.tag))
            .map(child => {
                return DiagnosticBuilder.childTagNotAllowed(node, child, document);
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
            .map(requiredTagName => DiagnosticBuilder.missingRequiredChild(node, requiredTagName, document));
        diagnostics.push(...errors);
    }

    isMissingEnd(node: Node, document: TextDocument) {
        return document.getText(toRange(node.end - 1, node.end, document)) !== '>';
    }
}
