import {Node} from 'vscode-html-languageservice';
import {TextDocument} from 'vscode';
import {normalizeAttributeName} from './helpers';

export namespace ships {
    export function getRefName(node: Node): string | undefined {
        if (node.tag == 'ship' && node.attributes && 'load' in node.attributes) {
            return normalizeAttributeName(node.attributes.load);
        }
    }

    export function getNameDef(node: Node): string | undefined {
        if (node.tag == 'ship' && node.attributes && 'name' in node.attributes)
            return normalizeAttributeName(node.attributes.name);
    }
}
