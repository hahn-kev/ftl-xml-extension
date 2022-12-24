import {ParseContext} from '../parsers/ftl-xml-parser';
import {RefMapperBase} from '../ref-mappers/ref-mapper';
import {Node} from 'vscode-html-languageservice';
import {FtlFile, FtlFileValue} from '../models/ftl-file';
import {FtlBlueprintList, FtlBlueprintValue} from '../models/ftl-blueprint-list';
import {addToKey, getAttrValueForTag, getNodeContent, nodeTagEq} from '../helpers';
import {FtlValue} from '../models/ftl-value';
import {NodeMapContext} from '../ref-mappers/node-mapping/node-map-context';
import {FtlRefParser} from '../ref-mappers/ref-parser';
import {ValueName} from '../ref-mappers/value-name';

type RefContext = { valueName: ValueName, mapper?: RefMapperBase };

export class BlueprintParser implements FtlRefParser {
  fileDataSelector(file: FtlFile): FtlFileValue<FtlBlueprintList, FtlValue> {
    return file.blueprintList;
  }

  constructor(private blueprintMappers: RefMapperBase[]) {
  }

  parseNode(context: ParseContext): void {
    // skip list child as it's handled when the blueprintList is passed in
    if (this.isListChild(context.node)) return;
    const valueName = this.getBlueprintListValueName(context);
    if (valueName) {
      const ftlBlueprintList = new FtlBlueprintList(valueName, context.file, context.node, context.document, !context.isModNode);
      ftlBlueprintList.childRefNames = context.node.children.filter((c) => nodeTagEq(c, 'name'))
          .map((c) => this.getBlueprintRef({node: c, document: context.document})?.name)
          .filter((t): t is string => !!t);

      for (const child of context.node.children) {
        const listChild = this.parseBlueprintRef({...context, node: child});
        if (listChild) ftlBlueprintList.children.push(listChild);
      }

      if (!context.isModNode) context.file.blueprintList.defs.push(ftlBlueprintList);
      addToKey(context.file.blueprintList.refs, ftlBlueprintList.name, ftlBlueprintList);
      return;
    }

    if (this.parseBlueprintRef(context)) return;

    for (const mapper of this.blueprintMappers) {
      mapper.parser.parseNode(context);
    }
  }

  parseBlueprintRef(context: ParseContext) {
    const ref = this.getBlueprintRef(context);
    if (!ref) return;
    const ftlBlueprintValue = new FtlBlueprintValue(ref, context.file, context.node, context.document, false);
    addToKey(context.file.blueprintList.refs, ftlBlueprintValue.name, ftlBlueprintValue);
    return ftlBlueprintValue;
  }

  /*
   * will return refs for a list child, or for a choice[req], or removeItem contents, or raritylist > blueprint[name]
   */
  getBlueprintRef(context: NodeMapContext) {
    let valueName = getAttrValueForTag(context.node, 'choice', 'req', context.document);
    if (valueName?.name.startsWith('SEC ')) valueName = undefined;
    if (valueName) return valueName;
    if (nodeTagEq(context.node, 'removeItem') || this.isListChild(context.node)) {
      valueName = getNodeContent(context.node, context.document);
    }
    if (!valueName && nodeTagEq(context.node.parent, 'rarityList')) {
      valueName = getAttrValueForTag(context.node, 'blueprint', 'name', context.document);
    }
    if (!valueName) return;

    if (valueName.name.startsWith('HIDDEN ')) {
      valueName.name = valueName.name.substring('HIDDEN '.length);
    }
    return valueName;
  }

  isListChild(node: Node) {
    return nodeTagEq(node, 'name') && nodeTagEq(node.parent, 'blueprintList');
  }

  getBlueprintListValueName(context: NodeMapContext) {
    return getAttrValueForTag(context.node, 'blueprintList', 'name', context.document);
  }

  getNameDef(context: NodeMapContext) {
    let def = this.getBlueprintListValueName(context);
    if (def) return def;
    for (const mapper of this.blueprintMappers) {
      def = mapper.parser.getNameDef(context);
      if (def) return def;
    }
  }

  getRefName(context: NodeMapContext) {
    const results = this.getRefNameAndMapper(context);
    return results?.map((c) => c.valueName);
  }

  /*
   * returns undefined for mapper if it's mapped by the blueprint mapper
   */
  getRefNameAndMapper(context: NodeMapContext): RefContext[] | undefined {
    const ref = this.getBlueprintRef(context);
    if (ref) return [{valueName: ref}];
    for (const blueprintMapper of this.blueprintMappers) {
      let ref = blueprintMapper.parser.getRefName(context);
      if (!ref) continue;
      if (!Array.isArray(ref)) {
        ref = [ref];
      }
      if (ref.length == 0) continue;
      return ref.map((rn) => ({valueName: rn, mapper: blueprintMapper}));
    }
  }
}
