import {Node} from 'vscode-html-languageservice';
import {Range, TextDocument} from 'vscode';
import {normalizeAttributeName} from './helpers';

export namespace events {
    function isLoadEvent(node: Node) {
        return node.tag == "loadEvent";
    }

    function inLoadAttribute(node: Node): boolean {
        return !!(node.tag == 'event' && node.attributes && 'load' in node.attributes);
    }

    export function getEventRefName(node: Node, document: TextDocument): string | undefined {
        if (inLoadAttribute(node)) {
            return normalizeAttributeName(node.attributes!.load);
        }

        if (isLoadEvent(node)) {
            return getLoadEventName(node, document);
        }
        if (node.tag == 'event' && node.attributes && 'name' in node.attributes && node.parent?.tag == 'sectorDescription')
            return normalizeAttributeName(node.attributes.name);
    }


    export function getLoadEventName(node: Node, document: TextDocument) {
        if (node.startTagEnd === undefined || node.endTagStart === undefined) return undefined;
        return document.getText(new Range(document.positionAt(node.startTagEnd), document.positionAt(node.endTagStart)));
    }

    export function getEventName(node: Node, document: TextDocument): string | undefined {
        return events.getEventRefName(node, document) ?? getEventNameDef(node);
    }

    export function getEventNameDef(node: Node): string | undefined {
        if ((node.tag == 'eventList' || node.tag == 'event') && node.attributes && 'name' in node.attributes && node.parent?.tag != 'sectorDescription')
            return normalizeAttributeName(node.attributes.name);
    }
}

