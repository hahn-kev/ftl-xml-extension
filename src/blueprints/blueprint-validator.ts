import {Validator} from '../validators/validator';
import {FtlFile} from '../models/ftl-file';
import {FtlDiagnostic} from '../models/ftl-diagnostic';
import {DiagnosticBuilder} from '../diagnostic-builder';
import {BlueprintMapper} from './blueprint-mapper';
import {BlueprintListTypeAny} from '../data/ftl-data';
import {FtlBlueprintList} from '../models/ftl-blueprint-list';

export class BlueprintValidator implements Validator {
  constructor(private mapper: BlueprintMapper) {
  }

  validateFile(file: FtlFile, diagnostics: FtlDiagnostic[]): void {
    this.validateLists(file, diagnostics);
    this.validateRefTypes(file, diagnostics);
    this.validateRefNames(file, diagnostics);
  }

  validateLists(file: FtlFile, diagnostics: FtlDiagnostic[]) {
    for (const def of file.blueprintList.defs) {
      this.validateList(def, diagnostics);
    }
  }

  validateList(blueprintList: FtlBlueprintList, diagnostics: FtlDiagnostic[]) {
    const listName = blueprintList.name;
    const namesInLoop = this.mapper.findRefLoop(listName, blueprintList.childRefNames);
    if (namesInLoop) {
      diagnostics.push(DiagnosticBuilder.listHasRefLoop(blueprintList.range, listName, namesInLoop));
    } else {
      this.validateListType(blueprintList, diagnostics);
    }
  }

  static ignoreListNames = ['DLC_ITEMS', 'DEMO_LOCKED_ITEMS'];

  validateListType(blueprintList: FtlBlueprintList, diagnostics: FtlDiagnostic[]) {
    const listName = blueprintList.name;
    if (!listName || BlueprintValidator.ignoreListNames.includes(listName)) return;

    const typeResults = this.mapper.getListTypeInfoFromBlueprint(blueprintList);
    if (!typeResults) return [];
    const {map: typeMapper, listTypeName} = typeResults;
    if (listTypeName == BlueprintListTypeAny) return;
    for (const [type, blueprintValues] of typeMapper) {
      // skip unknown because it'll be a warning from tryGetInvalidRefName
      if (type == listTypeName || type == 'Unknown') return;
      diagnostics.push(...blueprintValues.map((value) => DiagnosticBuilder.listTypeMisMatch(value.name,
          type,
          listTypeName,
          value.range)));
    }
  }

  validateRefTypes(file: FtlFile, diagnostics: FtlDiagnostic[]) {
    for (const {ref, mapper} of this.mapper.listRefs(file)) {
      // fixes case for RANDOM which is valid for multiple names
      if (mapper.isNameValid(ref.name)) continue;

      const defType = this.mapper.getRefType(ref.name);
      // skip because it'll be a warning from tryGetInvalidRefName
      if (defType == 'Unknown') continue;
      if (mapper.typeName === defType) continue;
      diagnostics.push(DiagnosticBuilder.blueprintRefTypeInvalid(ref.range, defType, ref.name, mapper.typeName));
    }
  }

  validateRefNames(file: FtlFile, diagnostics: FtlDiagnostic[]): void {
    for (const [refName, refs, blueprintMapper] of this.mapper.refMaps(file)) {
      if (this.mapper.isNameValid(refName)) continue;
      for (const ref of refs) {
        diagnostics.push(DiagnosticBuilder.invalidRefName(refName, ref.range, blueprintMapper.typeName));
      }
    }

    for (const [refName, refs] of file.blueprintList.refs) {
      if (this.mapper.isNameValid(refName)) continue;
      for (const ref of refs) {
        diagnostics.push(DiagnosticBuilder.invalidRefName(refName, ref.range, this.mapper.typeName));
      }
    }
  }
}
