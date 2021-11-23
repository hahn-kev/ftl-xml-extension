import {Validator} from '../validators/validator';
import {FtlFile} from '../models/ftl-file';
import {Diagnostic, TextDocument} from 'vscode';
import {DiagnosticBuilder} from '../diagnostic-builder';
import {BlueprintMapper} from './blueprint-mapper';
import {BlueprintListTypeAny} from '../data/ftl-data';
import {FtlBlueprintList} from '../models/ftl-blueprint-list';

export class BlueprintValidator implements Validator {
    constructor(private mapper: BlueprintMapper) {
    }

    validateFile(file: FtlFile, document: TextDocument, diagnostics: Diagnostic[]): void {
        this.validateListRefLoopFtlFile(file, diagnostics);
    }

    validateListRefLoopFtlFile(file: FtlFile, diagnostics: Diagnostic[]) {
        for (let def of file.blueprintList.defs) {
            this.validateList(def, diagnostics);
        }
    }

    validateList(blueprintList: FtlBlueprintList, diagnostics: Diagnostic[]) {
        let listName = blueprintList.name;
        let namesInLoop = this.mapper.findRefLoop(listName, blueprintList.childRefNames);
        if (namesInLoop) {
            diagnostics.push(DiagnosticBuilder.listHasRefLoop(blueprintList.range, listName, namesInLoop));
        } else {
            this.validateListType(blueprintList, diagnostics);
        }
    }

    static ignoreListNames = ['DLC_ITEMS', 'DEMO_LOCKED_ITEMS'];

    validateListType(blueprintList: FtlBlueprintList, diagnostics: Diagnostic[]) {
        let listName = blueprintList.name;
        if (!listName || BlueprintValidator.ignoreListNames.includes(listName)) return;

        let typeResults = this.mapper.getListTypeInfoFromBlueprint(blueprintList);
        if (!typeResults) return [];
        let {map: typeMapper, listTypeName} = typeResults;
        if (listTypeName == BlueprintListTypeAny) return;

        typeMapper.forEach((blueprintValues, type) => {
            //skip unknown because it'll be a warning from tryGetInvalidRefName
            if (type == listTypeName || type == 'Unknown') return;
            diagnostics.push(...blueprintValues.map(value =>
                DiagnosticBuilder.listTypeMisMatch(value.name, type, listTypeName, value.range)));
        });

    }
}
