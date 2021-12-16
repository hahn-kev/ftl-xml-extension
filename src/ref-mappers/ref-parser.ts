import {Node} from 'vscode-html-languageservice';
import {FtlFile, FtlFileValue} from '../models/ftl-file';
import {Position, TextDocument} from 'vscode';
import {FtlValue} from '../models/ftl-value';
import {FtlXmlParser, ParseContext} from '../parsers/ftl-xml-parser';
import {NodeMap} from './node-map';

export interface FtlRefParser extends FtlXmlParser, NodeMap {
  fileDataSelector: (file: FtlFile) => FtlFileValue<FtlValue>;
}

export type FtlValueConst<T> = { new(name: string, file: FtlFile, node: Node, document: TextDocument): T; }
    | { new(name: string, file: FtlFile, node: Node, document: TextDocument, isDef: boolean): T; };

export class RefParser<T extends FtlValue = FtlValue> implements FtlRefParser {
  constructor(public fileDataSelector: (file: FtlFile) => FtlFileValue<T>,
              private readonly newFromNode: FtlValueConst<T>,
              public readonly nodeMap: NodeMap) {
  }

  parseNode({node, file, document}: ParseContext): void {
    const nameDef = this.nodeMap.getNameDef(node, document);
    if (nameDef) {
      const fileValue = this.fileDataSelector(file);
      // eslint-disable-next-line new-cap
      const ftlEvent = new this.newFromNode(nameDef, file, node, document, true);
      fileValue.defs.push(ftlEvent);
      fileValue.addRef(nameDef, ftlEvent);
    } else {
      let nameRefs = this.nodeMap.getRefName(node, document);

      if (nameRefs) {
        const fileValue = this.fileDataSelector(file);
        if (typeof nameRefs === 'string') nameRefs = [nameRefs];
        for (const nameRef of nameRefs) {
          // eslint-disable-next-line new-cap
          fileValue.addRef(nameRef, new this.newFromNode(nameRef, file, node, document, false));
        }
      }
    }
  }

  getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
    return this.nodeMap.getNameDef(node, document, position);
  }

  getRefName(node: Node, document: TextDocument, position: Position): string | undefined;
  getRefName(node: Node, document: TextDocument): string | string[] | undefined;
  getRefName(node: Node, document: TextDocument, position?: Position): string | string[] | undefined {
    if (position) {
      return this.nodeMap.getRefName(node, document, position);
    }
    return this.nodeMap.getRefName(node, document);
  }
}
