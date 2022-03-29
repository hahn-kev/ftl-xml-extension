import {Node} from 'vscode-html-languageservice';
import {FtlFile, FtlFileValue} from '../models/ftl-file';
import {FtlValue} from '../models/ftl-value';
import {FtlXmlParser, ParseContext} from '../parsers/ftl-xml-parser';
import {FtlTextDocument} from '../models/ftl-text-document';
import {NodeMap} from './node-mapping/node-map';
import {NodeMapContext} from './node-mapping/node-map-context';
import {ValueName} from './value-name';

export interface FtlRefParser extends FtlXmlParser, NodeMap {
  fileDataSelector: (file: FtlFile) => FtlFileValue<FtlValue>;
}

export type FtlValueConst<T> = { new(valueName: ValueName, file: FtlFile, node: Node, document: FtlTextDocument): T; }
    | { new(valueName: ValueName, file: FtlFile, node: Node, document: FtlTextDocument, isDef: boolean): T; };

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

    const nameRefs = this.getRefName(context);
    if (nameRefs) {
      this.handleReference(context, nameRefs);
    }
  }

  protected handleReference(context: ParseContext, valueNames: ValueName | ValueName[]) {
    const fileValue = this.fileDataSelector(context.file);
    if (!Array.isArray(valueNames)) valueNames = [valueNames];
    for (const nameRef of valueNames) {
      // eslint-disable-next-line new-cap
      fileValue.addRef(nameRef.name, new this.newFromNode(nameRef, context.file, context.node, context.document, false));
    }
  }

  protected handleDefinition(context: ParseContext, valueName: ValueName): T {
    const fileValue = this.fileDataSelector(context.file);
    // eslint-disable-next-line new-cap
    const ftlValue = new this.newFromNode(valueName, context.file, context.node, context.document, !context.isModNode);
    if (!context.isModNode) fileValue.defs.push(ftlValue);
    fileValue.addRef(valueName.name, ftlValue);
    return ftlValue;
  }

  getNameDef(context: NodeMapContext) {
    return this.nodeMap.getNameDef(context);
  }

  getRefName(context: NodeMapContext) {
    return this.nodeMap.getRefName(context);
  }
}
