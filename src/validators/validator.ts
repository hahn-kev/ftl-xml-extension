import {FtlFile} from '../models/ftl-file';
import {Diagnostic, TextDocument} from 'vscode';

export interface Validator {
    validateFile(file: FtlFile, document: TextDocument, diagnostics: Diagnostic[]): void;
}
