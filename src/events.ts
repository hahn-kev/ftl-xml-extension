import {Node} from 'vscode-html-languageservice';
import {getAttrValueForTag, getNodeTextContent, hasAttr, nodeTagEq, normalizeAttributeName} from './helpers';
import {Position} from 'vscode-languageserver-textdocument';
import {FtlTextDocument} from './models/ftl-text-document';
import {ParseContext} from './parsers/ftl-xml-parser';
import {NodeMap} from './ref-mappers/node-mapping/node-map';
import {NodeMapContext} from './ref-mappers/node-mapping/node-map-context';

class EventsMap implements NodeMap {
  getNameDef(context: NodeMapContext): string | undefined {
    if (nodeTagEq(context.node.parent, 'sectorDescription', 'loadEventList')) return;
    if (nodeTagEq(context.node, 'eventList', 'event')
        && hasAttr(context.node, 'name', context.document, context.position)) {
      return normalizeAttributeName(context.node.attributes.name);
    }
  }

  getRefName(node: Node, document: FtlTextDocument, position: Position): string | undefined;
  getRefName(node: Node, document: FtlTextDocument): string | string[] | undefined;
  getRefName(node: Node, document: FtlTextDocument, position?: Position): string | string[] | undefined {
    if (nodeTagEq(node, 'event') && hasAttr(node, 'load', document, position)) {
      return normalizeAttributeName(node.attributes.load);
    }

    if (nodeTagEq(node, 'exitBeacon')) {
      const refs: string[] = [];
      if (hasAttr(node, 'event', document, position)) {
        refs.push(normalizeAttributeName(node.attributes.event));
      }
      if (hasAttr(node, 'nebulaEvent', document, position)) {
        refs.push(normalizeAttributeName(node.attributes.nebulaEvent));
      }
      if (hasAttr(node, 'rebelEvent', document, position)) {
        refs.push(normalizeAttributeName(node.attributes.rebelEvent));
      }
      if (position) return refs[0];
      return refs;
    }

    if (nodeTagEq(node, 'rebelBeacon')) {
      const refs: string[] = [];
      if (hasAttr(node, 'event', document, position)) {
        refs.push(normalizeAttributeName(node.attributes.event));
      }
      if (hasAttr(node, 'nebulaEvent', document, position)) {
        refs.push(normalizeAttributeName(node.attributes.nebulaEvent));
      }
      if (position) return refs[0];
      return refs;
    }
    if (nodeTagEq(node, 'eventAlias')) {
      const refs: string[] = [];
      if (hasAttr(node, 'name', document, position)) {
        refs.push(normalizeAttributeName(node.attributes.name));
      }
      const contents = getNodeTextContent(node, document, 'eventAlias');
      if (contents) refs.push(contents);
      if (position) return refs[0];
      return refs;
    }

    if (nodeTagEq(node, 'event')
        && nodeTagEq(node.parent, 'sectorDescription', 'loadEventList')
        && hasAttr(node, 'name', document, position)) {
      return normalizeAttributeName(node.attributes.name);
    }
    return getNodeTextContent(node, document, 'startEvent')
        ?? getNodeTextContent(node, document, 'loadEvent')
        ?? getNodeTextContent(node, document, 'nebulaEvent')
        ?? getNodeTextContent(node, document, 'jumpEvent')
        ?? getNodeTextContent(node, document, 'deathEvent')
        ?? getNodeTextContent(node, document, 'revisitEvent')
        ?? getNodeTextContent(node, document, 'queueEvent')
        ?? getNodeTextContent(node, document, 'renameBeacon')
        ?? getAttrValueForTag(node, 'triggeredEvent', 'event', document, position)
        ?? getAttrValueForTag(node, 'loadEventList', 'default', document, position)
        ?? getAttrValueForTag(node, 'destroyed', 'load', document, position)
        ?? getAttrValueForTag(node, 'deadCrew', 'load', document, position)
        ?? getAttrValueForTag(node, 'surrender', 'load', document, position)
        ?? getAttrValueForTag(node, 'escape', 'load', document, position)
        ?? getAttrValueForTag(node, 'gotaway', 'load', document, position)
        ?? getAttrValueForTag(node, 'quest', 'event', document, position);
  }

  isRecursionUnsafeEventRef(context: ParseContext) {
    return nodeTagEq(context.node, 'event')
        && !nodeTagEq(context.node.parent, 'eventList')
        && hasAttr(context.node, 'load', context.document);
  }
}


export const events = new EventsMap();
