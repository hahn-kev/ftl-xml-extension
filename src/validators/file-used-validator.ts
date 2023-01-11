
import {AddDiagnostics, RootValidator} from './validator';
import {FtlRoot} from '../models/ftl-root';
import {PathRefMapperBase, PathRefMappers} from '../ref-mappers/path-ref-mapper';
import {DiagnosticBuilder} from '../diagnostic-builder';

export class FileUsedValidator implements RootValidator {

  constructor(private pathMappers: PathRefMappers) {
  }

  public validate(root: FtlRoot, addDiagnostics: AddDiagnostics): void {
    for (const pathMapper of this.pathMappers.mappers) {
      if (pathMapper === this.pathMappers.imageMapper) continue;
      for (const resourceFile of pathMapper.selectRootFiles(root)) {
        if (pathMapper.lookupFileRefs(resourceFile).length == 0) {
          addDiagnostics(resourceFile.uri.toString(),
              [DiagnosticBuilder.fileNotReferenced({start: {line: 0, character: 0}, end: {line: 0, character: 0}})]);
        }
      }

    }
  }

}
