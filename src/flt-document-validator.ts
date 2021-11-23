import {DocumentCache} from './document-cache';
import {Diagnostic, DiagnosticCollection, TextDocument, Uri, workspace} from 'vscode';
import {Node} from 'vscode-html-languageservice';
import {RefMapperBase} from './ref-mappers/ref-mapper';
import {FtlData, XmlTag} from './data/ftl-data';
import {FtlParser} from './ftl-parser';
import {FtlFile} from './models/ftl-file';
import {Validator} from './validators/validator';
import {DiagnosticBuilder} from './diagnostic-builder';

export class FltDocumentValidator {

    constructor(private documentCache: DocumentCache,
                private diagnosticCollection: DiagnosticCollection,
                private mappers: RefMapperBase[],
                private parser: FtlParser,
                private validators: Validator[]) {
    }

    async validateFiles(files: Uri[]) {
        for (let fileUri of files) {
            await this.validateDocument(await workspace.openTextDocument(fileUri));
        }
    }

    async validateFtlFiles(files: FtlFile[]) {
        //todo convert once we don't need to parse the file
        await this.validateFiles(files.map(f => f.uri));
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
}
