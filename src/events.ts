import {Node} from 'vscode-html-languageservice';
import {Position, TextDocument} from 'vscode';
import {getAttrValueForTag, getNodeTextContent, hasAttr, normalizeAttributeName} from './helpers';
import {NodeMap} from './ref-mappers/ref-mapper';

class EventsMap implements NodeMap {
  getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
    return this.getEventNameDef(node, document, position);
  }

  getRefName(node: Node, document: TextDocument, position: Position): string | undefined;
  getRefName(node: Node, document: TextDocument): string | string[] | undefined;
  getRefName(node: Node, document: TextDocument, position?: Position): string | string[] | undefined {
    return position ? this.getEventRefName(node, document, position) : this.getEventRefName(node, document);
  }

  getEventRefName(node: Node, document: TextDocument, position: Position): string | undefined
  getEventRefName(node: Node, document: TextDocument): string | string[] | undefined
  getEventRefName(node: Node, document: TextDocument, position?: Position): string | string[] | undefined {
    if (node.tag == 'event' && hasAttr(node, 'load', document, position)) {
      return normalizeAttributeName(node.attributes.load);
    }

    if (node.tag == 'exitBeacon') {
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

    if (node.tag == 'rebelBeacon') {
      // todo support multi return
      if (hasAttr(node, 'event', document, position)) {
        return normalizeAttributeName(node.attributes.event);
      }
      if (hasAttr(node, 'nebulaEvent', document, position)) {
        return normalizeAttributeName(node.attributes.nebulaEvent);
      }
    }

    if (node.tag == 'triggeredEvent') {
      return getAttrValueForTag(node, 'triggeredEvent', 'event', document, position);
    }

    if (node.tag == 'loadEvent') {
      return getNodeTextContent(node, document);
    }
    if (node.tag == 'loadEventList') {
      return getAttrValueForTag(node, 'loadEventList', 'default', document, position);
    }

    if (node.tag == 'event' && (node.parent?.tag == 'sectorDescription' || node.parent?.tag == 'loadEventList')
        && hasAttr(node, 'name', document, position)) {
      return normalizeAttributeName(node.attributes.name);
    }
    return getNodeTextContent(node, document, 'startEvent')
        ?? getNodeTextContent(node, document, 'nebulaEvent')
        ?? getNodeTextContent(node, document, 'jumpEvent')
        ?? getAttrValueForTag(node, 'destroyed', 'load', document, position)
        ?? getAttrValueForTag(node, 'deadCrew', 'load', document, position)
        ?? getAttrValueForTag(node, 'surrender', 'load', document, position)
        ?? getAttrValueForTag(node, 'escape', 'load', document, position)
        ?? getAttrValueForTag(node, 'gotaway', 'load', document, position)
        ?? getAttrValueForTag(node, 'quest', 'event', document, position);
  }

  getEventNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
    if ((node.tag != 'eventList' && node.tag != 'event')
        || node.parent?.tag == 'sectorDescription'
        || node.parent?.tag == 'loadEventList') {
      return undefined;
    }

    if (hasAttr(node, 'name', document, position)) {
      return normalizeAttributeName(node.attributes.name);
    }
  }
}


export const events = new EventsMap();
