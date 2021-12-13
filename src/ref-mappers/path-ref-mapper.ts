import {FtlValue} from '../models/ftl-value';
import {RefMapperBase} from './ref-mapper';
import {FtlFile, FtlFileValue} from '../models/ftl-file';
import {FtlRefParser} from './ref-parser';
import {Node} from 'vscode-html-languageservice';
import {Location, Position, TextDocument} from 'vscode';

export class PathRefMapper<T extends FtlValue> implements RefMapperBase {
  public readonly defs = new Map<string, FtlValue>();
  public readonly refs = new Map<string, FtlValue[]>();


  constructor(public readonly typeName: string,
              public fileDataSelector: (file: FtlFile) => FtlFileValue<FtlValue>,
              public readonly parser: FtlRefParser) {
  }

  public isNameValid(name: string): boolean {
    return false;
  }

  public lookupDef(node: Node, document: TextDocument, position: Position): Location | undefined {
    return undefined;
  }

  public lookupRefs(node: Node, document: TextDocument, position: Position): Location[] | undefined {
    return undefined;
  }

  public updateData(files: FtlFile[]): void {
    // todo implement
  }
}
