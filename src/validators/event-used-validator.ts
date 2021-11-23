import {Validator} from './validator';
import {FtlFile} from '../models/ftl-file';
import {Diagnostic, DiagnosticSeverity, TextDocument} from 'vscode';
import {RefMapper} from '../ref-mappers/ref-mapper';
import {FtlEvent} from '../models/ftl-event';
import {toRange} from '../helpers';

export class EventUsedValidator implements Validator {
    constructor(private mapper: RefMapper<FtlEvent>) {

    }

    validateFile(file: FtlFile, document: TextDocument, diagnostics: Diagnostic[]) {
        let invalidEventsDiagnostics = file.event.defs.filter(event => !this.isUsed(event)).map(event => new Diagnostic(
            toRange(event.startOffset, event.startTagEndOffset ?? event.endOffset, document),
            `Event: ${event.name} is not used anywhere, is this a bug?`,
            DiagnosticSeverity.Information));
        if (invalidEventsDiagnostics.length > 0) {
            diagnostics.push(...invalidEventsDiagnostics);
        }
    }

    isUsed(event: FtlEvent): boolean {
        return (this.mapper.refs.get(event.name)?.length ?? 0) > 1;
    }

}
