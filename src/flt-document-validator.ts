import {DocumentCache} from './document-cache';
import {Diagnostic, DiagnosticCollection, TextDocument, Uri} from 'vscode';
import {FtlParser} from './ftl-parser';
import {FtlFile} from './models/ftl-file';
import {Validator} from './validators/validator';
import {FtlRoot} from './models/ftl-root';

export class FltDocumentValidator {
  constructor(private documentCache: DocumentCache,
              private diagnosticCollection: DiagnosticCollection,
              private parser: FtlParser,
              private validators: Validator[]) {
  }

  async validateFiles(files: Uri[]) {
    console.time('validate file uris');
    const ftlFiles = await this.parser.files;
    for (const fileUri of files) {
      const ftlFile = ftlFiles.get(fileUri.toString());
      if (ftlFile) this.validateFile(ftlFile);
    }
    console.timeEnd('validate file uris');
  }

  validateFtlRoot(root: FtlRoot) {
    this.validateFtlFiles(Array.from(root.files.values()));
  }

  validateFtlFiles(files: FtlFile[]) {
    console.time('validate ftl files');
    for (const file of files) {
      this.validateFile(file);
    }
    console.timeEnd('validate ftl files');
  }

  validateFile(file: FtlFile) {
    const diagnostics: Diagnostic[] = [];
    diagnostics.push(...file.diagnostics);
    for (const validator of this.validators) {
      validator.validateFile(file, diagnostics);
    }
    this.diagnosticCollection.set(file.uri, diagnostics);
  }

  async validateDocument(document: TextDocument) {
    const ftlFiles = await this.parser.files;
    const file = ftlFiles.get(document.uri.toString());
    if (file) {
      this.validateFile(file);
    }
  }
}
