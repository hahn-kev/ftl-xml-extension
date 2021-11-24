import {DocumentCache} from './document-cache';
import {Diagnostic, DiagnosticCollection, TextDocument, Uri, workspace} from 'vscode';
import {RefMapperBase} from './ref-mappers/ref-mapper';
import {FtlParser} from './ftl-parser';
import {FtlFile} from './models/ftl-file';
import {Validator} from './validators/validator';

export class FltDocumentValidator {
  constructor(private documentCache: DocumentCache,
              private diagnosticCollection: DiagnosticCollection,
              private mappers: RefMapperBase[],
              private parser: FtlParser,
              private validators: Validator[]) {
  }

  async validateFiles(files: Uri[]) {
    for (const fileUri of files) {
      await this.validateDocument(await workspace.openTextDocument(fileUri));
    }
  }

  async validateFtlFiles(files: FtlFile[]) {
    // todo convert once we don't need to parse the file
    await this.validateFiles(files.map((f) => f.uri));
  }

  async validateDocument(document: TextDocument) {
    const files = await this.parser.files;
    const file = files.get(document.uri.toString());
    const diagnostics: Diagnostic[] = [];
    if (file) this.validateFile(file, document, diagnostics);
    this.diagnosticCollection.set(document.uri, diagnostics);
  }

  validateFile(file: FtlFile, document: TextDocument, diagnostics: Diagnostic[]) {
    diagnostics.push(...file.diagnostics);
    for (const validator of this.validators) {
      validator.validateFile(file, diagnostics);
    }
    for (const mapper of this.mappers) {
      mapper.validateRefNames(file, diagnostics);
    }
  }
}
