import {Node} from 'vscode-html-languageservice';
import {Range, TextDocument} from 'vscode';
import {inLoadAttribute, isLoadEvent} from './helpers';


export namespace events {
    export function getEventRefName(node: Node, document: TextDocument): string | undefined {
        if (inLoadAttribute(node)) {
            return normalizeEventName(node.attributes!.load);
        }

        if (isLoadEvent(node)) {
            return getLoadEventName(node, document);
        }
        if (node.tag == 'event' && node.attributes && 'name' in node.attributes && node.parent?.tag == 'sectorDescription')
            return normalizeEventName(node.attributes.name);
    }

    export function normalizeEventName(attr: string | null | undefined) {
        return attr?.slice(1, -1);
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
            return normalizeEventName(node.attributes.name);
    }
}

