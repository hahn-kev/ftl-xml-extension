import {Validator} from './validator';
import {FtlFile} from '../models/ftl-file';
import {Diagnostic} from 'vscode';
import {RefMapperBase} from '../ref-mappers/ref-mapper';
import {DiagnosticBuilder} from '../diagnostic-builder';
import {BlueprintMapper} from '../blueprints/blueprint-mapper';

export class RefNameValidator implements Validator {
  constructor(private mappers: RefMapperBase[], private blueprintMapper: BlueprintMapper) {
  }

  validateFile(file: FtlFile, diagnostics: Diagnostic[]): void {
    for (const mapper of this.mappers) {
      // skip here since it's handled in blueprint-validator
      if (mapper === this.blueprintMapper) continue;

      for (const [refName, refs] of mapper.parser.fileDataSelector(file).refs) {
        if (mapper.isNameValid(refName)) continue;
        for (const ref of refs) {
          diagnostics.push(DiagnosticBuilder.invalidRefName(refName, ref.range, mapper.typeName));
        }
      }
    }
  }
}
