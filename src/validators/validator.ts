import {FtlFile} from '../models/ftl-file';
import {FtlDiagnostic} from '../models/ftl-diagnostic';
import {FtlRoot} from '../models/ftl-root';

export interface Validator {
  validateFile(file: FtlFile, diagnostics: FtlDiagnostic[]): void;
}
export type AddDiagnostics = (uri: string, diagnostics: FtlDiagnostic[]) => void;
export interface RootValidator {
  validate(root: FtlRoot, addDiagnostics: AddDiagnostics): void;
}
