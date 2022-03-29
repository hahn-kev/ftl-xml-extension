import {FtlValue} from './ftl-value';
import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {getNodeContent, toRange} from '../helpers';
import {FtlTextDocument} from './ftl-text-document';
import {Range} from 'vscode-languageserver-textdocument';
import {ValueName} from '../ref-mappers/value-name';

export class FtlImageList extends FtlValue {
  readonly kind = 'image list';

  constructor(valueName: ValueName, file: FtlFile, node: Node, document: FtlTextDocument, isDef: boolean) {
    super(valueName, file, node, document, isDef);
    if (isDef) {
      this.imgList = node.children.map((child) => {
        const nodeTextContent = getNodeContent(child, document, 'img');
        return new ImgListFileRef(
            nodeTextContent?.name ?? '',
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
