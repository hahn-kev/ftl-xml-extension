import {FtlFile} from './ftl-file';
import {Location, Node} from 'vscode-html-languageservice';
import {FtlTextDocument} from './ftl-text-document';
import {Position, Range} from 'vscode-languageserver-textdocument';
import {ValueName} from '../ref-mappers/value-name';

export abstract class FtlValue {
  constructor(valueName: ValueName, file: FtlFile, node: Node, document: FtlTextDocument, public isDef: boolean) {
    this.file = file;
    this.name = valueName.name;
    this.range = valueName.range;
    // {
    //   start: document.positionAt(node.start),
    //   end: document.positionAt(node.children.length > 0 ? node.startTagEnd ?? node.end : node.end)
    // };
  }

  public abstract readonly kind: string;
  public file: FtlFile;
  public name: string;
  public range: Range;

  public autocompleteDescription?: string;

  toLocation() {
    return Location.create(this.file.uri, this.range);
  }
}

export class FtlGenericValue extends FtlValue {
  readonly kind = 'Generic';
}
