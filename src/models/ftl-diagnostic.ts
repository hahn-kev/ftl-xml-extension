import {Diagnostic} from 'vscode-html-languageservice';
import {DiagnosticSeverity} from 'vscode';

export type FtlDiagnostic = Diagnostic;
export enum FtlDiagnosticSeverity {
  Error = 0,
  Warning = 1,
  Information = 2,
  Hint = 3
}
