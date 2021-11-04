import {Node} from 'vscode-html-languageservice';
import {Position, TextDocument} from 'vscode';
import {
    getNodeTextContent,
    hasAttr,
    normalizeAttributeName
} from './helpers';

export namespace events {
    export function getEventRefName(node: Node, document: TextDocument, position?: Position): string | undefined {
        if (node.tag == 'event' && hasAttr(node, 'load', document, position)) {
            return normalizeAttributeName(node.attributes.load);
        }

        if (node.tag == "loadEvent") {
            return getNodeTextContent(node, document);
        }
        if (node.tag == 'event' && node.parent?.tag == 'sectorDescription' && hasAttr(node, 'name', document, position))
            return normalizeAttributeName(node.attributes.name);
    }

    export function getEventNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
        if ((node.tag != 'eventList' && node.tag != 'event') || node.parent?.tag == 'sectorDescription')
            return undefined;

        if (hasAttr(node, 'name', document, position))
            return normalizeAttributeName(node.attributes.name);
    }
}

