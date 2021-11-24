import {FtlFile} from '../models/ftl-file';
import {Diagnostic} from 'vscode';

export interface Validator {
  validateFile(file: FtlFile, diagnostics: Diagnostic[]): void;
}
