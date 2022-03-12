import {FtlFile} from '../models/ftl-file';
import {FtlDiagnostic} from '../models/ftl-diagnostic';

export interface Validator {
  validateFile(file: FtlFile, diagnostics: FtlDiagnostic[]): void;
}
