import {Diagnostic, DiagnosticSeverity, Range, TextDocument} from 'vscode';
import {Node} from 'vscode-html-languageservice';
import {toRange} from './helpers';
import {BlueprintListTypeAny} from './data/ftl-data';
import {InvalidRef} from './ref-mappers/ref-mapper';

export enum FtlErrorCode {
    listTypeMismatch = 'ftl-listTypeMismatch',
    refTypeInvalid = 'ftl-refTypeInvalid',
    refLoop = 'ftl-refLoop',
    unusedRef = 'ftl-unused-ref',
    invalidRefName = 'ftl-invalid-ref-name',
    childNotAllowed = 'ftl-child-not-allowed',
    missingRequiredChild = 'ftl-missing-required-child',
    tagNotClosed = 'ftl-tag-not-closed'
}

export class DiagnosticBuilder {
    static diag(range: Range, message: string, severity: DiagnosticSeverity, code: FtlErrorCode) {
        const diagnostic = new Diagnostic(range, message, severity);
        diagnostic.code = code;
        return diagnostic;
    }

    static listTypeMisMatch(blueprintName: undefined | string,
                            type: string,
                            listTypeName: string,
                            range: Range) {
        let message = `Blueprint '${blueprintName}' is an '${type}' does not match type the list '${listTypeName}'`;
        return this.diag(range, message, DiagnosticSeverity.Warning, FtlErrorCode.listTypeMismatch);
    }

    static listHasRefLoop(range: Range, listName: string, namesInLoop: string[]) {
        return this.diag(
            range,
            `Blueprint List: ${listName} is self referencing, path: ${namesInLoop.join(' -> ')}`,
            DiagnosticSeverity.Error,
            FtlErrorCode.refLoop
        );
    }

    static blueprintRefTypeInvalid(range: Range,
                                   defType: string,
                                   refName: string,
                                   refType: string) {
        if (defType == BlueprintListTypeAny) {
            defType = 'Blueprint List';
        }
        return this.diag(range,
            `${refType} can't reference a ${defType}, which is the type of blueprint: '${refName}'`,
            DiagnosticSeverity.Warning,
            FtlErrorCode.refTypeInvalid);
    }

    static refUnused(type: 'Ship' | 'Event', name: string, range: Range) {
        return this.diag(range,
            `${type}: ${name} is not used anywhere, is this a bug?`,
            DiagnosticSeverity.Information,
            FtlErrorCode.unusedRef);
    }

    static invalidRefName(invalidRef: InvalidRef) {
        return this.diag(invalidRef.range,
            `Invalid ${invalidRef.typeName} name: '${invalidRef.name}'`,
            DiagnosticSeverity.Warning,
            FtlErrorCode.invalidRefName);
    }

    static childTagNotAllowed(parent: Node, child: Node, document: TextDocument) {
        return this.diag(
            toRange(child.start, child.startTagEnd ?? child.end, document),
            `Tag: ${child.tag} is not allowed in a ${parent.tag}`,
            DiagnosticSeverity.Warning,
            FtlErrorCode.childNotAllowed
        );
    }

    static missingRequiredChild(node: Node, requiredName: string, document: TextDocument) {
        return this.diag(toRange(node.start, node.startTagEnd ?? node.end, document),
            `Tag: ${node.tag} is missing the required child: ${requiredName}`,
            DiagnosticSeverity.Warning, FtlErrorCode.missingRequiredChild
        );
    }

    static tagNotClosed(range: Range, tagName: string) {
        return this.diag(range,
            `Tag '${tagName}' is not properly closed`,
            DiagnosticSeverity.Error,
            FtlErrorCode.tagNotClosed);
    }
}
