import {Validator} from '../validators/validator';
import {FtlFile} from '../models/ftl-file';
import {Diagnostic} from 'vscode';
import {DiagnosticBuilder} from '../diagnostic-builder';
import {BlueprintMapper} from './blueprint-mapper';
import {BlueprintListTypeAny} from '../data/ftl-data';
import {FtlBlueprintList} from '../models/ftl-blueprint-list';

export class BlueprintValidator implements Validator {
  constructor(private mapper: BlueprintMapper) {
  }

  validateFile(file: FtlFile, diagnostics: Diagnostic[]): void {
    this.validateLists(file, diagnostics);
    this.validateRefTypes(file, diagnostics);
  }

  validateLists(file: FtlFile, diagnostics: Diagnostic[]) {
    for (const def of file.blueprintList.defs) {
      this.validateList(def, diagnostics);
    }
  }

  validateList(blueprintList: FtlBlueprintList, diagnostics: Diagnostic[]) {
    const listName = blueprintList.name;
    const namesInLoop = this.mapper.findRefLoop(listName, blueprintList.childRefNames);
    if (namesInLoop) {
      diagnostics.push(DiagnosticBuilder.listHasRefLoop(blueprintList.range, listName, namesInLoop));
    } else {
      this.validateListType(blueprintList, diagnostics);
    }
  }

  static ignoreListNames = ['DLC_ITEMS', 'DEMO_LOCKED_ITEMS'];

  validateListType(blueprintList: FtlBlueprintList, diagnostics: Diagnostic[]) {
    const listName = blueprintList.name;
    if (!listName || BlueprintValidator.ignoreListNames.includes(listName)) return;

    const typeResults = this.mapper.getListTypeInfoFromBlueprint(blueprintList);
    if (!typeResults) return [];
    const {map: typeMapper, listTypeName} = typeResults;
    if (listTypeName == BlueprintListTypeAny) return;

    typeMapper.forEach((blueprintValues, type) => {
      // skip unknown because it'll be a warning from tryGetInvalidRefName
      if (type == listTypeName || type == 'Unknown') return;
      diagnostics.push(...blueprintValues.map((value) =>
        DiagnosticBuilder.listTypeMisMatch(value.name, type, listTypeName, value.range)));
    });
  }

  validateRefTypes(file: FtlFile, diagnostics: Diagnostic[]) {
    for (const {ref, mapper} of this.mapper.listRefs(file)) {
      const refName = ref.name;
      const refMapper = mapper;

      // fixes case for RANDOM which is valid for multiple names
      if (refMapper.isNameValid(refName)) continue;

      const defType = this.mapper.getRefType(refName);
      // skip because it'll be a warning from tryGetInvalidRefName
      if (defType == 'Unknown') continue;
      if (refMapper.typeName === defType) continue;
      diagnostics.push(DiagnosticBuilder.blueprintRefTypeInvalid(ref.range,
          defType,
          refName,
          refMapper.typeName));
    }
  }
}
