import {NodeMapContext} from './node-map-context';
import {NodeMap, NodeMapImp} from './node-map';
import {getAttrValueForTag, getNodeTextContent, nodeTagEq} from '../../helpers';

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

type staticValueMapping = staticTagAttrMapping | staticTagContentMapping;

export function staticValueNodeMap(defs: staticValueMapping[], refs: staticValueMapping[]): NodeMap {
  function getResult(context: NodeMapContext, def: staticValueMapping): string | undefined {
    if (def.parentTag && !nodeTagEq(context.node.parent, def.parentTag)) return undefined;
    if (def.match && !def.match(context)) return undefined;
    if ('type' in def && def.type === 'contents') {
      return getNodeTextContent(context.node, context.document, def.tag);
    } else if ('attr' in def) {
      return getAttrValueForTag(context.node, def.tag, def.attr, context.document, context.position);
    }
  }

  return new NodeMapImp(
      (context) => {
        for (const def of defs) {
          const result = getResult(context, def);
          if (result) return result;
        }
      },
      ((context: NodeMapContext) => {
        const results: string[] = [];
        for (const ref of refs) {
          const result = getResult(context, ref);
          if (!result) continue;
          if ('position' in context) {
            return result;
          } else {
            results.push(result);
          }
        }
        return 'position' in context ? undefined : results;
      }) as any);
}
