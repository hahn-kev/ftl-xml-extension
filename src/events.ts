import {filterFalsy, getAttrValueForTag, getAttrValueName, getNodeContent, hasAttr, nodeTagEq} from './helpers';
import {ParseContext} from './parsers/ftl-xml-parser';
import {NodeMap} from './ref-mappers/node-mapping/node-map';
import {NodeMapContext} from './ref-mappers/node-mapping/node-map-context';

class EventsMap implements NodeMap {
  getNameDef(context: NodeMapContext) {
    if (nodeTagEq(context.node.parent, 'sectorDescription', 'loadEventList')) return;
    if (!nodeTagEq(context.node, 'eventList', 'event')) return;
    return getAttrValueName(context.node, 'name', context.document);
  }

  getRefName({document, node}: NodeMapContext) {
    if (nodeTagEq(node, 'event')) {
      if (nodeTagEq(node.parent, 'sectorDescription', 'loadEventList')) {
        return getAttrValueName(node, 'name', document);
      }
      return getAttrValueName(node, 'load', document);
    }

    if (nodeTagEq(node, 'exitBeacon')) {
      const refs = [
        getAttrValueName(node, 'event', document),
        getAttrValueName(node, 'nebulaEvent', document),
        getAttrValueName(node, 'rebelEvent', document),
      ];

      return filterFalsy(refs);
    }

    if (nodeTagEq(node, 'rebelBeacon')) {
      const refs = [
        getAttrValueName(node, 'event', document),
        getAttrValueName(node, 'nebulaEvent', document),
      ];
      return filterFalsy(refs);
    }
    if (nodeTagEq(node, 'eventAlias')) {
      const refs = [
        getAttrValueName(node, 'name', document),
        getNodeContent(node, document, 'eventAlias')
      ];
      return filterFalsy(refs);
    }
    return getNodeContent(node, document, 'startEvent')
        ?? getNodeContent(node, document, 'loadEvent')
        ?? getNodeContent(node, document, 'nebulaEvent')
        ?? getNodeContent(node, document, 'jumpEvent')
        ?? getNodeContent(node, document, 'deathEvent')
        ?? getNodeContent(node, document, 'revisitEvent')
        ?? getNodeContent(node, document, 'queueEvent')
        ?? getNodeContent(node, document, 'renameBeacon')
        ?? getAttrValueForTag(node, 'triggeredEvent', 'event', document)
        ?? getAttrValueForTag(node, 'loadEventList', 'default', document)
        ?? getAttrValueForTag(node, 'destroyed', 'load', document)
        ?? getAttrValueForTag(node, 'deadCrew', 'load', document)
        ?? getAttrValueForTag(node, 'surrender', 'load', document)
        ?? getAttrValueForTag(node, 'escape', 'load', document)
        ?? getAttrValueForTag(node, 'gotaway', 'load', document)
        ?? getAttrValueForTag(node, 'quest', 'event', document);
  }

  isRecursionUnsafeEventRef(context: ParseContext) {
    return nodeTagEq(context.node, 'event')
        && !nodeTagEq(context.node.parent, 'eventList')
        && hasAttr(context.node, 'load', context.document);
  }
}


export const events = new EventsMap();
