import {Diagnostic} from 'vscode-html-languageservice';

export type FtlDiagnostic = Diagnostic;
export enum FtlDiagnosticSeverity {
  Error = 0,
  Warning = 1,
  Information = 2,
  Hint = 3
}
