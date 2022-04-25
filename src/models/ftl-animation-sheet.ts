import {FtlValue} from './ftl-value';
import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {FtlTextDocument} from './ftl-text-document';
import {getAttrValueAsInt, getNodeContent} from '../helpers';
import {ValueName} from '../ref-mappers/value-name';
import {Range} from 'vscode-languageserver-textdocument';

export class FtlAnimationSheet extends FtlValue {
  constructor(valueName: ValueName, file: FtlFile, node: Node, document: FtlTextDocument, isDef: boolean) {
    super(valueName, file, node, document, isDef);
    if (isDef) {
      const contentValue = getNodeContent(node, document);
      this.sheetFilePath = contentValue?.name;
      this.sheetFileRange = contentValue?.range;
    }
    this.width = getAttrValueAsInt(node, 'w');
    this.height = getAttrValueAsInt(node, 'h');
    this.frameWidth = getAttrValueAsInt(node, 'fw');
    this.frameHeight = getAttrValueAsInt(node, 'fh');
  }

  readonly kind = 'animation sheet';
  public sheetFilePath?: string;
  public sheetFileRange?: Range;
  public width?: number;
  public height?: number;
  public frameWidth?: number;
  public frameHeight?: number;
}
