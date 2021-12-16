import {FtlFile, FtlFileValue} from '../models/ftl-file';
import {IValueSet, Node} from 'vscode-html-languageservice';
import {Location, Position, Range, TextDocument} from 'vscode';
import {addToKey} from '../helpers';
import {FtlValue} from '../models/ftl-value';
import {FtlRefParser, RefParser} from './ref-parser';

export type InvalidRef = { name: string, range: Range, typeName: string }

export interface RefProvider {
  lookupRefs(node: Node, document: TextDocument, position: Position): Location[] | undefined;

  lookupDef(node: Node, document: TextDocument, position: Position): Location | undefined;
}

export interface RefMapperBase extends RefProvider{
  updateData(files: FtlFile[]): void;


  readonly typeName: string;
  readonly defaults?: readonly string[];
  readonly nodeMap?: NodeMap;
  readonly autoCompleteValues?: IValueSet;
  readonly refs: Map<string, FtlValue[]>;
  readonly defs: Map<string, FtlValue>;
  readonly fileDataSelector: (file: FtlFile) => FtlFileValue<FtlValue>,
  readonly parser: FtlRefParser,

  isNameValid(name: string): boolean;
}

export interface NodeMap {
  getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined;

  getRefName(node: Node, document: TextDocument, position: Position): string | undefined;

  getRefName(node: Node, document: TextDocument): string | string[] | undefined;

  getRefName(node: Node, document: TextDocument): string | string[] | undefined;
}

export class RefMapper<T extends FtlValue> implements RefMapperBase {
  readonly refs = new Map<string, T[]>();
  readonly defs = new Map<string, T>();
  readonly fileDataSelector: (file: FtlFile) => FtlFileValue<FtlValue>;

  public get nodeMap(): NodeMap {
    return this.parser.nodeMap;
  }

  constructor(public parser: RefParser<T>,
              public readonly autoCompleteValues: IValueSet,
              public readonly typeName: string,
              public defaults: readonly string[] = [],
              private altRefMapper?: RefMapperBase) {
    this.fileDataSelector = this.parser.fileDataSelector;
  }

  updateData(files: FtlFile[]) {
    this.refs.clear();
    this.defs.clear();
    this.autoCompleteValues.values.length = 0;

    const names = new Set(files.flatMap((file) => this.parser.fileDataSelector(file).defs)
        .map((value) => value.name)
        .concat(this.defaults));

    this.autoCompleteValues.values
        .push(...Array.from(names.values()).map((name) => ({name})));

    for (const file of files) {
      this.parser.fileDataSelector(file).refs.forEach((value, key) => addToKey(this.refs, key, value));
      for (const value of this.parser.fileDataSelector(file).defs) {
        this.defs.set(value.name, value);
      }
    }
  }

  lookupRefs(node: Node, document: TextDocument, position: Position): Location[] | undefined {
    const name = this.getRefName(node, document, position);
    if (!name) return;
    const values = this.refs.get(name) ?? this.altRefMapper?.refs.get(name);
    return values?.map((value: FtlValue) => value.toLocation());
  }

  lookupDef(node: Node, document: TextDocument, position: Position): Location | undefined {
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
