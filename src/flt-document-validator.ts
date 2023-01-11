import {DiagnosticCollection, TextDocument, Uri} from 'vscode';
import {FtlFile} from './models/ftl-file';
import {AddDiagnostics, RootValidator, Validator} from './validators/validator';
import {FtlRoot} from './models/ftl-root';
import {DiagnosticBuilder} from './diagnostic-builder';
import {FtlDiagnostic} from './models/ftl-diagnostic';
import {VscodeConverter} from './vscode-converter';
import {FtlOutputChannel} from './output/ftl-output-channel';


export class FltDocumentValidator {
  constructor(private diagnosticCollection: DiagnosticCollection,
              private validators: Validator[],
              private rootValidators: RootValidator[],
              private output: FtlOutputChannel) {
  }

  public validateFtlRoot(root: FtlRoot) {
    this.validateFtlFiles(Array.from(root.xmlFiles.values()));
    for (const rootValidator of this.rootValidators) {
      rootValidator.validate(root, this.addDiagnostics);
    }
  }

  private validateFtlFiles(files: FtlFile[]) {
    try {
      this.output.time('validate ftl files');
      for (const file of files) {
        this.validateFile(file);
      }
    } finally {
      this.output.timeEnd('validate ftl files');
    }
  }

  public validateFile(file: FtlFile) {
    const diagnostics: FtlDiagnostic[] = [];
    if (file.isReferenced) {
      diagnostics.push(...file.diagnostics);
      for (const validator of this.validators) {
        validator.validateFile(file, diagnostics);
      }
    } else {
      diagnostics.push(DiagnosticBuilder.fileNotReferenced(file.firstLineRange));
    }

    this.addDiagnostics(file.uri, diagnostics);
  }

  private addDiagnostics: AddDiagnostics = (uri: string, diagnostics: FtlDiagnostic[]) => {
    this.diagnosticCollection.set(
        Uri.parse(uri),
        diagnostics.map((diag) => VscodeConverter.toVscodeDiagnostic(diag))
    );
  };

  public validateDocument(document: TextDocument, root: FtlRoot) {
    const ftlFiles = root.xmlFiles;
    const file = ftlFiles.get(document.uri.toString());
    if (file) {
      this.validateFile(file);
    }
    return file;
  }
  public validateDocuments(documents: readonly TextDocument[], root: FtlRoot) {
    const ftlFiles = root.xmlFiles;
    for (const document of documents) {
      const file = ftlFiles.get(document.uri.toString());
      if (file) {
        this.validateFile(file);
      }
    }
  }
}
