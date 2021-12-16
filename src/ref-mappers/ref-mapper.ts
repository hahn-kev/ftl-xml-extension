import {FtlFile, FtlFileValue} from '../models/ftl-file';
import {IValueSet, Node} from 'vscode-html-languageservice';
import {Location, Position, TextDocument} from 'vscode';
import {addToKey} from '../helpers';
import {FtlValue} from '../models/ftl-value';
import {FtlRefParser, RefParser} from './ref-parser';
import {LookupContext, LookupProvider} from './lookup-provider';
import {FtlRoot} from '../models/ftl-root';

export interface RefMapperBase extends LookupProvider {
  updateData(root: FtlRoot): void;

  readonly typeName: string;
  readonly defaults?: readonly string[];
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
              public defaults: readonly string[] = [],
              private altRefMapper?: RefMapperBase) {
    this.fileDataSelector = this.parser.fileDataSelector;
  }

  updateData(root: FtlRoot): void {
    this.refs.clear();
    this.defs.clear();
    this.autoCompleteValues.values.length = 0;

    const names = new Set(Array.from(root.files.values()).flatMap((file) => this.parser.fileDataSelector(file).defs)
        .map((value) => value.name)
        .concat(this.defaults));

    this.autoCompleteValues.values
        .push(...Array.from(names.values()).map((name) => ({name})));

    for (const file of root.files.values()) {
      this.parser.fileDataSelector(file).refs.forEach((value, key) => addToKey(this.refs, key, value));
      for (const value of this.parser.fileDataSelector(file).defs) {
        this.defs.set(value.name, value);
      }
    }
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
        || this.defaults.includes(name)
        || (this.altRefMapper?.isNameValid(name) ?? false);
  }
}
