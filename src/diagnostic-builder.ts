import {Diagnostic, DiagnosticSeverity, Range, TextDocument} from 'vscode';
import {Node} from 'vscode-html-languageservice';
import {toRange} from './helpers';
import {BlueprintListTypeAny} from './data/ftl-data';

export enum FtlErrorCode {
    listTypeMismatch = 'ftl-listTypeMismatch',
    refLoop = 'ftl-refLoop'
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
                            childNode: Node,
                            document: TextDocument) {
        let message = `Blueprint '${blueprintName}' is an '${type}' does not match type the list '${listTypeName}'`;
        return this.diag(toRange(childNode.start, childNode.end, document),
            message,
            DiagnosticSeverity.Warning,
            FtlErrorCode.listTypeMismatch);
    }

    static listHasRefLoop(node: Node, document: TextDocument, listName: string) {
        return this.diag(
            toRange(node.start, node.startTagEnd ?? node.end, document),
            `Blueprint List: ${listName} is self referencing (possibly through another list)`,
            DiagnosticSeverity.Error,
            FtlErrorCode.refLoop
        );
    }

    static blueprintRefTypeInvalid(node: Node,
                                   document: TextDocument,
                                   defType: string,
                                   refName: string,
                                   refType: string) {
        if (defType == BlueprintListTypeAny) {
            defType = 'Blueprint List';
        }
        return new Diagnostic(toRange(node.start, node.startTagEnd ?? node.end, document),
            `${refType} can't reference a ${defType}, which is the type of blueprint: '${refName}' `,
            DiagnosticSeverity.Warning);
    }
}
