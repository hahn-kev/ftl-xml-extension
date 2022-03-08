import {DocumentCache} from './document-cache';
import {Diagnostic, DiagnosticCollection, TextDocument} from 'vscode';
import {FtlFile} from './models/ftl-file';
import {Validator} from './validators/validator';
import {FtlRoot} from './models/ftl-root';
import {DiagnosticBuilder} from './diagnostic-builder';

export class FltDocumentValidator {
  constructor(private documentCache: DocumentCache,
              private diagnosticCollection: DiagnosticCollection,
              private validators: Validator[]) {
  }

  public validateFtlRoot(root: FtlRoot) {
    this.validateFtlFiles(Array.from(root.xmlFiles.values()));
  }

  private validateFtlFiles(files: FtlFile[]) {
    console.time('validate ftl files');
    for (const file of files) {
      this.validateFile(file);
    }
    console.timeEnd('validate ftl files');
  }

  public validateFile(file: FtlFile) {
    const diagnostics: Diagnostic[] = [];
    if (file.isReferenced) {
      diagnostics.push(...file.diagnostics);
      for (const validator of this.validators) {
        validator.validateFile(file, diagnostics);
      }
    } else {
      diagnostics.push(DiagnosticBuilder.fileNotReferenced(file.firstLineRange));
    }

    this.diagnosticCollection.set(file.uri, diagnostics);
  }

  public validateDocument(document: TextDocument, root: FtlRoot) {
    const ftlFiles = root.xmlFiles;
    const file = ftlFiles.get(document.uri.toString());
    if (file) {
      this.validateFile(file);
    }
    return file;
  }
}
