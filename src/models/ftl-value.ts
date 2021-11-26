import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {Location, Position, Range, TextDocument} from 'vscode';

export abstract class FtlValue {
  constructor(name: string, file: FtlFile, node: Node, document: TextDocument, isDef: boolean) {
    this.file = file;
    this.name = name;
    this.startOffset = node.start;
    this.startTagEndOffset = node.startTagEnd;
    this.endOffset = node.end;
    this.endTagStartOffset = node.endTagStart;
    this.positionStart = document.positionAt(node.start);
    this.positionEnd = document.positionAt(node.end);
    this.range = new Range(this.positionStart,
        document.positionAt(node.children.length > 0 ? node.startTagEnd ?? node.end : node.end));
  }

  public abstract readonly kind: string;
  public file: FtlFile;
  public name: string;
  public startOffset: number;
  public startTagEndOffset: number | undefined;
  public endOffset: number;
  public endTagStartOffset: number | undefined;
  public positionStart: Position;
  public positionEnd: Position;
  public range: Range;

  toLocation() {
    return new Location(this.file.uri, this.range);
  }
}
