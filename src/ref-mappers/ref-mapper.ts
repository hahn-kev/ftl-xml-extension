import {FtlFile, FtlFileValue} from '../models/ftl-file';
import {IValueData, IValueSet, Node} from 'vscode-html-languageservice';
import {Location, Position, TextDocument} from 'vscode';
import {addToKey} from '../helpers';
import {FtlValue} from '../models/ftl-value';
import {FtlRefParser, RefParser} from './ref-parser';
import {LookupContext, LookupProvider} from './lookup-provider';
import {FtlRoot} from '../models/ftl-root';
import {DataReceiver} from '../providers/ftl-data-provider';

export interface RefMapperBase extends LookupProvider, DataReceiver {

  readonly typeName: string;
  readonly baseGameDefaults?: readonly string[];
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

  constructor(public parser: RefParser<T>,
              public readonly autoCompleteValues: IValueSet,
              public readonly typeName: string,
              public baseGameDefaults: readonly string[] = [],
              private altRefMapper?: RefMapperBase) {
    this.fileDataSelector = this.parser.fileDataSelector;
  }

  updateData(root: FtlRoot): void {
    this.refs.clear();
    this.defs.clear();
    this.autoCompleteValues.values.length = 0;
    this.autoCompleteValues.values
        .push(...this.convertDefsAndDefaultsToAutoCompleteList(root));

    for (const file of root.xmlFiles.values()) {
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
    return autoCompleteValueList;
  }

  static convertValueToAutocompleteValue(value: FtlValue): IValueData {
    if (value.autocompleteDescription) {
      return {name: value.name, description: value.autocompleteDescription};
    }
    return {name: value.name};
  }

  lookupRefs({node, document, position}: LookupContext): Location[] | undefined {
    const name = this.getRefName(node, document, position);
    if (!name) return;
    const values = this.refs.get(name) ?? this.altRefMapper?.refs.get(name);
    return values?.map((value: FtlValue) => value.toLocation());
  }

  lookupDef({node, document, position}: LookupContext): Location | undefined {
    const name = this.getRefName(node, document, position);
    if (!name) return;
    const value = this.defs.get(name) ?? this.altRefMapper?.defs.get(name);
    if (value) return value.toLocation();
  }

  getRefName(node: Node, document: TextDocument, position: Position) {
    return this.parser.nodeMap.getNameDef(node, document, position)
        ?? this.parser.nodeMap.getRefName(node, document, position);
  }


  isNameValid(name: string) {
    return this.defs.has(name)
        || this.baseGameDefaults.includes(name)
        || (this.altRefMapper?.isNameValid(name) ?? false);
  }
}
