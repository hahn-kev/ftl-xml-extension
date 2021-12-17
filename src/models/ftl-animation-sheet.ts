import {FtlValue} from './ftl-value';
import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {TextDocument} from 'vscode';
import {getAttrValueAsInt, getNodeTextContent} from '../helpers';

export class FtlAnimationSheet extends FtlValue {
  constructor(name: string, file: FtlFile, node: Node, document: TextDocument, isDef: boolean) {
    super(name, file, node, document, isDef);
    this.sheetFilePath = isDef ? getNodeTextContent(node, document) : undefined;
    this.width = getAttrValueAsInt(node, 'w');
    this.height = getAttrValueAsInt(node, 'h');
    this.frameWidth = getAttrValueAsInt(node, 'fw');
    this.frameHeight = getAttrValueAsInt(node, 'fh');
  }

  readonly kind = 'animation sheet';
  public sheetFilePath?: string;
  public width?: number;
  public height?: number;
  public frameWidth?: number;
  public frameHeight?: number;
}
