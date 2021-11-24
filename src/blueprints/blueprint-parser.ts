import {FtlXmlParser} from '../parsers/ftl-xml-parser';
import {RefMapperBase} from '../ref-mappers/ref-mapper';
import {Node} from 'vscode-html-languageservice';
import {FtlFile, FtlFileValue} from '../models/ftl-file';
import {Position, TextDocument} from 'vscode';
import {FtlBlueprintList, FtlBlueprintValue} from '../models/ftl-blueprint-list';
import {addToKey, getAttrValueForTag, getNodeTextContent} from '../helpers';
import {FtlValue} from '../models/ftl-value';

type RefContext = { name: string, mapper?: RefMapperBase };

export class BlueprintParser implements FtlXmlParser {
  fileDataSelector(file: FtlFile): FtlFileValue<FtlBlueprintList, FtlValue> {
    return file.blueprintList;
  }

  constructor(private blueprintMappers: RefMapperBase[]) {
  }

  parseNode(node: Node, file: FtlFile, document: TextDocument): void {
    const name = this.getBlueprintListName(node, document);
    if (name) {
      const ftlBlueprintList = new FtlBlueprintList(name, file, node, document);
      ftlBlueprintList.childRefNames = node.children.filter((c) => c.tag == 'name')
          .map((c) => this.getNameNodeText(c, document))
          .filter((t): t is string => !!t);

      for (const child of node.children) {
        const listChild = this.parseListChild(child, file, document);
        if (listChild) ftlBlueprintList.children.push(listChild);
      }

      file.blueprintList.defs.push(ftlBlueprintList);
      addToKey(file.blueprintList.refs, name, ftlBlueprintList);
      return;
    }

    for (const mapper of this.blueprintMappers) {
      mapper.parser.parseNode(node, file, document);
    }
  }

  parseListChild(node: Node, file: FtlFile, document: TextDocument) {
    const refName = this.getNameNodeText(node, document);
    if (!refName) return;
    const ftlBlueprintValue = new FtlBlueprintValue(refName, file, node, document);
    addToKey(file.blueprintList.refs, refName, ftlBlueprintValue);
    return ftlBlueprintValue;
  }

  getNameNodeText(node: Node, document: TextDocument) {
    if (!this.isListChild(node)) return;
    const name = getNodeTextContent(node, document);
    if (name?.startsWith('HIDDEN ')) {
      return name?.substring('HIDDEN '.length);
    }
    return name;
  }

  isListChild(node: Node) {
    return node.tag == 'name' && node.parent?.tag == 'blueprintList';
  }

  getBlueprintListName(node: Node, document: TextDocument, position?: Position) {
    return getAttrValueForTag(node, 'blueprintList', 'name', document, position);
  }

  getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
    let name = this.getBlueprintListName(node, document, position);
    if (name) return name;
    for (const mapper of this.blueprintMappers) {
      name = mapper.parser.getNameDef(node, document, position);
      if (name) return name;
    }
  }

  getRefName(node: Node, document: TextDocument, position: Position): string | undefined
  getRefName(node: Node, document: TextDocument): string[] | undefined
  getRefName(node: Node, document: TextDocument, position?: Position): string | string[] | undefined {
    if (position) return this.getRefNameAndMapper(node, document, position)?.name;
    return this.getRefNameAndMapper(node, document)?.map((c) => c.name);
  }

  /**
   * returns undefined for mapper if it's mapped by the blueprint mapper
   */
  getRefNameAndMapper(node: Node, document: TextDocument, position: Position): RefContext | undefined
  getRefNameAndMapper(node: Node, document: TextDocument): RefContext[] | undefined
  getRefNameAndMapper(
      node: Node,
      document: TextDocument,
      position?: Position): RefContext | RefContext[] | undefined {
    const refName = this.getNameNodeText(node, document);
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
