import {FtlFile, FtlFileValue} from '../models/ftl-file';
import {IValueData, IValueSet, Location, Node} from 'vscode-html-languageservice';
import {addToKey, filterValueNameToPosition} from '../helpers';
import {FtlValue} from '../models/ftl-value';
import {FtlRefParser, RefParser} from './ref-parser';
import {LookupContext, LookupProvider} from './lookup-provider';
import {FtlRoot} from '../models/ftl-root';
import {DataReceiver} from '../providers/ftl-data-provider';
import {FtlTextDocument} from '../models/ftl-text-document';
import {Position} from 'vscode-languageserver-textdocument';

export interface RefMapperBase extends LookupProvider, DataReceiver {

  readonly typeName: string;
  readonly baseGameDefaults?: readonly string[];
  readonly hyperSpaceGameDefaults?: readonly string[];
  readonly autoCompleteValues?: IValueSet;
  readonly refs: Map<string, FtlValue[]>;
  readonly defs: Map<string, FtlValue>;
  readonly fileDataSelector: (file: FtlFile) => FtlFileValue<FtlValue>,
  readonly parser: FtlRefParser,

  isNameValid(name: string): boolean;
}

export class RefMapper<T extends FtlValue> implements RefMapperBase {
  readonly refs = new Map<string, T[]>();
  readonly defs = new Map<string, T>();
  readonly fileDataSelector: (file: FtlFile) => FtlFileValue<FtlValue>;
  private hasHyperspace: boolean = false;

  constructor(public parser: RefParser<T>,
              public readonly autoCompleteValues: IValueSet,
              public readonly typeName: string,
              public baseGameDefaults: readonly string[] = [],
              public hyperSpaceGameDefaults: readonly string[] = [],
              private altRefMapper?: RefMapperBase) {
    this.fileDataSelector = this.parser.fileDataSelector;
  }

  updateData(root: FtlRoot): void {
    this.refs.clear();
    this.defs.clear();
    this.hasHyperspace = root.hasHyperspace();
    this.autoCompleteValues.values.length = 0;
    this.autoCompleteValues.values
        .push(...this.convertDefsAndDefaultsToAutoCompleteList(root));

    for (const file of root.xmlFiles.values()) {
      if (!file.isReferenced) continue;
      this.parser.fileDataSelector(file).refs.forEach((value, key) => addToKey(this.refs, key, value));
      for (const value of this.parser.fileDataSelector(file).defs) {
        this.defs.set(value.name, value);
      }
    }
  }

  convertDefsAndDefaultsToAutoCompleteList(root: FtlRoot) {
    const seenNames = new Set<string>();
    const autoCompleteValueList: IValueData[] = [];
    for (const file of root.xmlFiles.values()) {
      for (const def of this.parser.fileDataSelector(file).defs) {
        if (seenNames.has(def.name)) continue;
        autoCompleteValueList.push(RefMapper.convertValueToAutocompleteValue(def));
        seenNames.add(def.name);
      }
    }
    for (const name of this.baseGameDefaults) {
      if (seenNames.has(name)) continue;
      autoCompleteValueList.push({name});
      seenNames.add(name);
    }
    // Add Hyperspace defaults if any Hyperspace files are present
    if (this.hasHyperspace) {
      for (const name of this.hyperSpaceGameDefaults) {
        if (seenNames.has(name)) continue;
        autoCompleteValueList.push({name});
        seenNames.add(name);
      }
    }
    return autoCompleteValueList;
  }

  static convertValueToAutocompleteValue(value: FtlValue): IValueData {
    if (value.autocompleteDescription) {
      return {name: value.name, description: value.autocompleteDescription};
    }
    return {name: value.name};
  }

  lookupRefs(context: LookupContext): Location[] | undefined {
    const valueName = filterValueNameToPosition(this.getRefName(context), context.position);
    if (!valueName) return;
    const values = this.refs.get(valueName.name) ?? this.altRefMapper?.refs.get(valueName.name);
    return values?.map((value: FtlValue) => value.toLocation());
  }

  lookupDef(context: LookupContext): Location | undefined {
    const valueName = filterValueNameToPosition(this.getRefName(context), context.position);
    if (!valueName) return;
    const value = this.defs.get(valueName.name) ?? this.altRefMapper?.defs.get(valueName.name);
    if (value) return value.toLocation();
  }

  getRefName(context: LookupContext) {
    return this.parser.nodeMap.getNameDef(context)
        ?? this.parser.nodeMap.getRefName(context);
  }


  isNameValid(name: string) {
    return this.defs.has(name)
        || this.baseGameDefaults.includes(name)
        || (this.hasHyperspace && this.hyperSpaceGameDefaults.includes(name))
        || (this.altRefMapper?.isNameValid(name) ?? false);
  }
}
