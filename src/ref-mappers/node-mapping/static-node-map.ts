import {NodeMapContext} from './node-map-context';
import {NodeMap, NodeMapImp} from './node-map';
import {getAttrValueForTag, getNodeContent, nodeTagEq} from '../../helpers';
import {ValueName} from '../value-name';

interface staticMappingBase {
  tag: string;
  parentTag?: string;
  match?: (context: NodeMapContext) => boolean;
}

interface staticTagAttrMapping extends staticMappingBase {
  attr: string;
}

interface staticTagContentMapping extends staticMappingBase {
  type: 'contents'
}

export type StaticValueMapping = staticTagAttrMapping | staticTagContentMapping;

export function staticValueNodeMap(defs: StaticValueMapping[], refs: StaticValueMapping[]): NodeMap {
  function getResult(context: NodeMapContext, def: StaticValueMapping) {
    if (def.parentTag && !nodeTagEq(context.node.parent, def.parentTag)) return undefined;
    if (def.match && !def.match(context)) return undefined;
    if ('type' in def && def.type === 'contents') {
      return getNodeContent(context.node, context.document, def.tag);
    } else if ('attr' in def) {
      return getAttrValueForTag(context.node, def.tag, def.attr, context.document);
    }
  }

  return new NodeMapImp(
      (context) => {
        for (const def of defs) {
          const result = getResult(context, def);
          if (result) return result;
        }
      },
      (context: NodeMapContext) => {
        const results: ValueName[] = [];
        for (const ref of refs) {
          const result = getResult(context, ref);
          if (!result) continue;
          results.push(result);
        }
        return results;
      });
}
