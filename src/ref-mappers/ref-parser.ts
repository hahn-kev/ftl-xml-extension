import {Node} from 'vscode-html-languageservice';
import {FtlFile, FtlFileValue} from '../models/ftl-file';
import {FtlValue} from '../models/ftl-value';
import {FtlXmlParser, ParseContext} from '../parsers/ftl-xml-parser';
import {FtlTextDocument} from '../models/ftl-text-document';
import {Position} from 'vscode-languageserver-textdocument';
import {NodeMap} from './node-mapping/node-map';
import {NodeMapContext} from './node-mapping/node-map-context';

export interface FtlRefParser extends FtlXmlParser, NodeMap {
  fileDataSelector: (file: FtlFile) => FtlFileValue<FtlValue>;
}

export type FtlValueConst<T> = { new(name: string, file: FtlFile, node: Node, document: FtlTextDocument): T; }
    | { new(name: string, file: FtlFile, node: Node, document: FtlTextDocument, isDef: boolean): T; };

export class RefParser<T extends FtlValue = FtlValue> implements FtlRefParser {
  constructor(public fileDataSelector: (file: FtlFile) => FtlFileValue<T>,
              private readonly newFromNode: FtlValueConst<T>,
              public readonly nodeMap: NodeMap) {
  }

  parseNode(context: ParseContext): void {
    const nameDef = this.getNameDef(context);
    if (nameDef) {
      this.handleDefinition(context, nameDef);
      return;
    }

    const nameRefs = this.getRefName(context.node, context.document);
    if (nameRefs) {
      this.handleReference(context, nameRefs);
    }
  }

  protected handleReference(context: ParseContext, nameRefs: string | string[]) {
    const fileValue = this.fileDataSelector(context.file);
    if (typeof nameRefs === 'string') nameRefs = [nameRefs];
    for (const nameRef of nameRefs) {
      // eslint-disable-next-line new-cap
      fileValue.addRef(nameRef, new this.newFromNode(nameRef, context.file, context.node, context.document, false));
    }
  }

  protected handleDefinition(context: ParseContext, name: string): T {
    const fileValue = this.fileDataSelector(context.file);
    // eslint-disable-next-line new-cap
    const ftlValue = new this.newFromNode(name, context.file, context.node, context.document, !context.isModNode);
    if (!context.isModNode) fileValue.defs.push(ftlValue);
    fileValue.addRef(name, ftlValue);
    return ftlValue;
  }

  getNameDef(context: NodeMapContext): string | undefined {
    return this.nodeMap.getNameDef(context);
  }

  getRefName(node: Node, document: FtlTextDocument, position: Position): string | undefined;
  getRefName(node: Node, document: FtlTextDocument): string | string[] | undefined;
  getRefName(node: Node, document: FtlTextDocument, position?: Position): string | string[] | undefined {
    if (position) {
      return this.nodeMap.getRefName(node, document, position);
    }
    return this.nodeMap.getRefName(node, document);
  }
}
