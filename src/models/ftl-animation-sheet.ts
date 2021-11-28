import {FtlValue} from './ftl-value';
import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {TextDocument} from 'vscode';
import {getNodeTextContent} from '../helpers';

export class FtlAnimationSheet extends FtlValue {
  constructor(name: string, file: FtlFile, node: Node, document: TextDocument, isDef: boolean) {
    super(name, file, node, document, isDef);
    this.sheetFilePath = isDef ? getNodeTextContent(node, document) : undefined;
  }

  readonly kind = 'animation sheet';
  public sheetFilePath?: string;
}
