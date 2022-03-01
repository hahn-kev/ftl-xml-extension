import {FtlValue} from './ftl-value';
import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {Range, TextDocument} from 'vscode';
import {getNodeTextContent, toRange} from '../helpers';

export class FtlImageList extends FtlValue {
  readonly kind = 'image list';

  constructor(name: string, file: FtlFile, node: Node, document: TextDocument, isDef: boolean) {
    super(name, file, node, document, isDef);
    if (isDef) {
      this.imgList = node.children.map((child) => {
        const nodeTextContent = getNodeTextContent(child, document, 'img');
        return new ImgListFileRef(
            nodeTextContent ?? '',
            toRange(child.start, child.end, document)
        );
      });
    } else {
      this.imgList = [];
    }
  }

  imgList: ImgListFileRef[];
}

class ImgListFileRef {
  constructor(path: string, range: Range) {
    this.path = path;
    this.range = range;
  }

  path: string;
  range: Range;
}