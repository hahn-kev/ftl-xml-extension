import {FtlXmlParser, ParseContext} from '../parsers/ftl-xml-parser';
import {RefMapperBase} from '../ref-mappers/ref-mapper';
import {Node} from 'vscode-html-languageservice';
import {FtlFile, FtlFileValue} from '../models/ftl-file';
import {FtlBlueprintList, FtlBlueprintValue} from '../models/ftl-blueprint-list';
import {addToKey, getAttrValueForTag, getNodeTextContent, nodeTagEq} from '../helpers';
import {FtlValue} from '../models/ftl-value';
import {FtlTextDocument} from '../models/ftl-text-document';
import {Position} from 'vscode-languageserver-textdocument';

type RefContext = { name: string, mapper?: RefMapperBase };

export class BlueprintParser implements FtlXmlParser {
  fileDataSelector(file: FtlFile): FtlFileValue<FtlBlueprintList, FtlValue> {
    return file.blueprintList;
  }

  constructor(private blueprintMappers: RefMapperBase[]) {
  }

  parseNode(context: ParseContext): void {
    // skip list child as it's handled when the blueprintList is passed in
    if (this.isListChild(context.node)) return;
    const name = this.getBlueprintListName(context.node, context.document);
    if (name) {
      const ftlBlueprintList = new FtlBlueprintList(name, context.file, context.node, context.document, true);
      ftlBlueprintList.childRefNames = context.node.children.filter((c) => nodeTagEq(c, 'name'))
          .map((c) => this.getBlueprintRef(c, context.document))
          .filter((t): t is string => !!t);

      for (const child of context.node.children) {
        const listChild = this.parseBlueprintRef(child, context.file, context.document);
        if (listChild) ftlBlueprintList.children.push(listChild);
      }

      context.file.blueprintList.defs.push(ftlBlueprintList);
      addToKey(context.file.blueprintList.refs, name, ftlBlueprintList);
      return;
    }

    if (this.parseBlueprintRef(context.node, context.file, context.document)) return;

    for (const mapper of this.blueprintMappers) {
      mapper.parser.parseNode(context);
    }
  }

  parseBlueprintRef(node: Node, file: FtlFile, document: FtlTextDocument) {
    const refName = this.getBlueprintRef(node, document);
    if (!refName) return;
    const ftlBlueprintValue = new FtlBlueprintValue(refName, file, node, document, false);
    addToKey(file.blueprintList.refs, refName, ftlBlueprintValue);
    return ftlBlueprintValue;
  }

  /*
   * will return refs for a list child, or for a choice[req]
   */
  getBlueprintRef(node: Node, document: FtlTextDocument, position?: Position) {
    if (!this.isListChild(node)) return getAttrValueForTag(node, 'choice', 'req', document, position);
    const name = getNodeTextContent(node, document);
    if (name?.startsWith('HIDDEN ')) {
      return name?.substring('HIDDEN '.length);
    }
    return name;
  }

  isListChild(node: Node) {
    return nodeTagEq(node, 'name') && nodeTagEq(node.parent, 'blueprintList');
  }

  getBlueprintListName(node: Node, document: FtlTextDocument, position?: Position) {
    return getAttrValueForTag(node, 'blueprintList', 'name', document, position);
  }

  getNameDef(node: Node, document: FtlTextDocument, position?: Position): string | undefined {
    let name = this.getBlueprintListName(node, document, position);
    if (name) return name;
    for (const mapper of this.blueprintMappers) {
      name = mapper.parser.getNameDef(node, document, position);
      if (name) return name;
    }
  }

  getRefName(node: Node, document: FtlTextDocument, position: Position): string | undefined
  getRefName(node: Node, document: FtlTextDocument): string[] | undefined
  getRefName(node: Node, document: FtlTextDocument, position?: Position): string | string[] | undefined {
    if (position) return this.getRefNameAndMapper(node, document, position)?.name;
    return this.getRefNameAndMapper(node, document)?.map((c) => c.name);
  }

  /**
   * returns undefined for mapper if it's mapped by the blueprint mapper
   */
  getRefNameAndMapper(node: Node, document: FtlTextDocument, position: Position): RefContext | undefined
  getRefNameAndMapper(node: Node, document: FtlTextDocument): RefContext[] | undefined
  getRefNameAndMapper(
      node: Node,
      document: FtlTextDocument,
      position?: Position): RefContext | RefContext[] | undefined {
    const refName = this.getBlueprintRef(node, document, position);
    if (refName && !position) return [{name: refName}];
    if (refName) return {name: refName};
    for (const blueprintMapper of this.blueprintMappers) {
      let refName = position ? blueprintMapper.parser.getRefName(node, document, position)
          : blueprintMapper.parser.getRefName(node, document);
      if (!refName) continue;
      if (typeof refName == 'string') {
        if (position) return {name: refName, mapper: blueprintMapper};
        refName = [refName];
      }
      return refName.map((rn: string) => ({name: rn, mapper: blueprintMapper}));
    }
  }
}
