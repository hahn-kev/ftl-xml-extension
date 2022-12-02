import {Node} from 'vscode-html-languageservice';
import {FtlTextDocument, FtlUri} from './models/ftl-text-document';
import {Position, Range} from 'vscode-languageserver-textdocument';
import {ValueName} from './ref-mappers/value-name';

export interface Progress<T> {
    report(value: T): void;
}

export function nodeTagEq(node: Node, tag: string): boolean
export function nodeTagEq(node: Node, tag: string, tag2: string): boolean
export function nodeTagEq(node: Node | undefined, tag: string): node is Node
export function nodeTagEq(node: Node | undefined, tag: string, tag2: string): node is Node
export function nodeTagEq(node: Node | undefined, tag: string, tag2?: string): boolean {
    let nodeTagName = node?.tag;
    if (!nodeTagName) return false;
    nodeTagName = normalizeTagName(nodeTagName, node);
    
    return nodeTagMatches(nodeTagName, tag) || (tag2 !== undefined && nodeTagMatches(nodeTagName, tag2));
}

function nodeTagMatches(tagName: string, pattern: string): boolean {
    if (pattern.startsWith('!')) {
        return '!' + tagName !== pattern;
    }
    return tagName === pattern;
}

export function normalizeTagName(nodeTagName: string, node?: Node): string
export function normalizeTagName(nodeTagName: string | undefined): string | undefined
export function normalizeTagName(nodeTagName: string | undefined, node?: Node): string | undefined {
    if (!nodeTagName) return;
    if (nodeTagName.startsWith('mod-append:')) return nodeTagName.substring('mod-append:'.length);
    if (nodeTagName.startsWith('mod-overwrite:')) return nodeTagName.substring('mod-overwrite:'.length);
    if (node) {
        if (nodeTagName == 'mod:findLike') return getAttrValue(node, 'type') ?? nodeTagName;
        if (nodeTagName == 'mod:findName') return getAttrValue(node, 'type') ?? nodeTagName;
        if (nodeTagName == 'mod:findWithChildLike') return getAttrValue(node, 'type') ?? nodeTagName;
    }
    return nodeTagName;
}

export function transformModNode(node: Node): Node | undefined {
    if (!node.tag) return;
    if (node.tag.startsWith('mod:find')) return transformModFindNode(node);
    if (node.parent && (node.tag.startsWith('mod-append:') || node.tag.startsWith('mod-overwrite:'))) {
        const parentFindNode = transformModFindNode(node.parent);
        if (!parentFindNode) return;
        return parentFindNode.children.find(c => c.start == node.start);
    }
}

export function transformModFindNode(node: Node): Node | undefined {
    if (node.tag == 'mod:findName' && hasAttr(node, 'type') && hasAttr(node, 'name')) {
        return handleModCommands(copyNode(node, {
            tag: normalizeAttributeName(node.attributes.type),
            attributes: {name: node.attributes.name}
        }));
    }
    if (node.tag == 'mod:findLike' && hasAttr(node, 'type')) {
        const selectorNode = node.children.find((c) => c.tag == 'mod:selector');
        return handleModCommands(copyNode(node, {
            tag: normalizeAttributeName(node.attributes.type),
            attributes: selectorNode?.attributes
        }));
    }
    if (node.tag == 'mod:findWithChildLike' && hasAttr(node, 'type') && hasAttr(node, 'child-type')) {
        const childType = node.attributes['child-type'];
        const selectorNode = node.children.find((c) => c.tag == 'mod:selector');

        const newNode = copyNode(node, {tag: normalizeAttributeName(node.attributes.type)});
        if (selectorNode) {
            newNode.children.push({...selectorNode, tag: normalizeAttributeName(childType), parent: newNode});
        }
        return handleModCommands(newNode);
    }
}

function handleModCommands(newNode: Node): Node {
    const childrenToAdd: Node[] = [];
    const childrenToRemove: Set<Node> = new Set<Node>();
    for (const child of newNode.children) {
        if (child.tag == 'mod:setAttributes' && child.attributes && newNode.attributes) {
            Object.assign(newNode.attributes, child.attributes);
        }
        if (child.tag == 'mod:setValue') {
            childrenToRemove.add(child);
            if (child.children.length > 0) {
                childrenToAdd.push(...child.children.map((cc) => copyNode(cc, {parent: newNode})));
            } else {
                newNode.startTagEnd = child.startTagEnd;
                newNode.endTagStart = child.endTagStart;
            }
        }
        if (child.tag?.startsWith('mod-append:') || child.tag?.startsWith('mod-overwrite:')) {
            childrenToRemove.add(child);
            childrenToAdd.push(copyNode(child, {tag: normalizeTagName(child.tag, child)}));
        }
    }
    newNode.children.push(...childrenToAdd);
    newNode.children = newNode.children.filter((c) => !childrenToRemove.has(c));
    return newNode;
}

export function copyNode(node: Node, newContents: Partial<Node>): Node {
    const prototype = Object.getPrototypeOf(node);
    const newNode = Object.create(prototype) as Node;
    Object.assign(newNode, node, {children: [...node.children]}, newContents);
    return newNode;
}

export function hasAncestor(node: Node, name: string, includeSelf: boolean): boolean {
    if (!node.tag) return false;
    if (includeSelf && nodeTagEq(node, name)) return true;
    if (!node.parent) return false;
    return hasAncestor(node.parent, name, true);
}

export function getNodeContent(
    node: Node,
    document: FtlTextDocument,
    whenTagName?: string,
    whenParentTagName?: string): undefined | ValueName {
    if (node.startTagEnd === undefined || node.endTagStart === undefined) return undefined;
    if (typeof whenTagName === 'string' && !nodeTagEq(node, whenTagName)) return undefined;
    if (typeof whenParentTagName === 'string' && !nodeTagEq(node.parent, whenParentTagName)) return undefined;
    return new ValueName(getText(node.startTagEnd, node.endTagStart, document),
        toRange(node.startTagEnd, node.endTagStart, document));
}

export function toRange(start: number, end: number, document: FtlTextDocument): Range {
    return {start: document.positionAt(start), end: document.positionAt(end)};
}

export function contains(range: Range, position: Position): boolean {
    if (position.line < range.start.line || range.end.line < position.line) return false;
    if (range.start.line == range.end.line && range.start.line == position.line) {
        return range.start.character <= position.character && position.character <= range.end.character;
    }
    if (position.line == range.start.line) return range.start.character <= position.character;
    if (position.line == range.end.line) return position.character <= range.end.character;
    return true;
}

export function filterValueNameToPosition(
    ref: ValueName | ValueName[] | undefined,
    position: Position): ValueName | undefined {
    if (!ref) return undefined;
    if (Array.isArray(ref)) {
        return ref.find(r => contains(r.range, position));
    }
    return contains(ref.range, position) ? ref : undefined;
}

export function getText(start: number, end: number, document: FtlTextDocument) {
    const documentText = document.getText();
    const subStrResult = documentText.substring(start, end);
    return subStrResult;
}

export function normalizeAttributeName(attr: string): string;
export function normalizeAttributeName(attr: null | undefined): undefined;
export function normalizeAttributeName(attr: string | null | undefined): string | undefined;
export function normalizeAttributeName(attr: string | null | undefined): string | undefined {
    return attr?.slice(1, -1);
}

export function getAttrValueForTag(
    node: Node,
    tagName: string,
    attrName: string,
    document: FtlTextDocument): ValueName | undefined {
    if (!nodeTagEq(node, tagName)) return;
    return getAttrValueName(node, attrName, document);
}

export function getAttrValueName(
    node: Node,
    attrName: string,
    document: FtlTextDocument): ValueName | undefined {
    const range = getAttrValueRange(attrName, node, document);
    if (!range) return;
    return new ValueName(normalizeAttributeName(node.attributes![attrName]!),
        toRange(range.startOffset, range.endOffset, document));
}

export function getAttrValueAsInt(node: Node, attrName: string): number | undefined {
    const value = getAttrValue(node, attrName);
    return value ? parseInt(value) : undefined;
}

export function getAttrValue(node: Node | undefined, attrName: string): string | undefined {
    if (!node) return;
    if (hasAttr(node, attrName)) {
        const value = normalizeAttributeName(node.attributes[attrName]);
        return value === '' ? undefined : value;
    }
}

type OffsetRange = { startOffset: number, endOffset: number };

/**
 * determine if the node has the given attribute
 * @param node
 * @param name
 * @param document optional provide with a position to determine if the position is within the attribute value
 * @param atPosition
 */
export function hasAttr<T extends string>(
    node: Node,
    name: T,
    document?: FtlTextDocument,
    atPosition?: Position): node is Node & { attributes: Record<T, string> } {
    if (!node.attributes) return false;
    if (!(name in node.attributes)) return false;
    if (document && atPosition) {
        return isInAttrValue(node, document, name, atPosition);
    }
    return true;
}

export function getEol(eol: 1 | 2): string {
    return eol == 1 ? '\n' : '\r\n';
}

export function isInAttrValue(node: Node, document: FtlTextDocument, attrName: string, position: Position): boolean {
    const text = getText(node.start, node.startTagEnd ?? node.end, document);
    const nameRange = attrNameRange(node, document, position);
    if (!nameRange) return false;
    const attrStart = nameRange.startOffset - node.start;
    const attrEnd = nameRange.endOffset - node.start;

    const foundAttrName = text.substring(attrStart, attrEnd);
    return foundAttrName === attrName;
}

export function attrNameRange(node: Node, document: FtlTextDocument, position: Position): OffsetRange | undefined {
    const text = getText(node.start, node.startTagEnd ?? node.end, document);
    const positionOffset = document.offsetAt(position) - 1;

    if (positionOffset < node.start || (node.startTagEnd ?? node.end) < positionOffset) return;
    const cursorOffsetInText = positionOffset - node.start;

    let attrEnd: number | undefined;
    let attrStart: number | undefined;
    for (let i = cursorOffsetInText; i > 0; i--) {
        if (attrEnd === undefined) {
            if (text.charAt(i) != '"') continue;
            i--;
            if (text.charAt(i) != '=') continue;
            attrEnd = i;
        }
        // we've found =" keep going to get the attribute name
        if (text.charAt(i) == ' ') {
            attrStart = i + 1;
            break;
        }
    }
    if (attrEnd === undefined || attrStart === undefined) return;
    return {startOffset: node.start + attrStart, endOffset: node.start + attrEnd};
}

export function getAttrValueRange(attr: string, node: Node, document: FtlTextDocument): OffsetRange | undefined {
    if (!node.attributes || !(attr in node.attributes)) return undefined;
    const attrValue = node.attributes[attr];

    const nodeStartText = getText(node.start, node.startTagEnd ?? node.end, document);
    const attrIndex = nodeStartText.search(attr + '[\\s=]');

    const attrValueStart = node.start + nodeStartText.indexOf(`"`, attrIndex) + 1;
    const attrValueEnd = attrValueStart + (attrValue?.length ?? 2) - 2;
    return {startOffset: attrValueStart, endOffset: attrValueEnd};
}

export function firstWhere<T, R>(list: T[], map: (value: T) => R) {
    for (const value of list) {
        const mapped = map(value);
        if (mapped) return mapped;
    }
}

export function addToKey<T, Key>(map: Map<Key, T[]>, key: Key, value: T | T[]) {
    let arr = map.get(key);

    if (value instanceof Array) {
        if (!arr) {
            map.set(key, [...value]);
            return;
        }
        arr.push(...value);
        return;
    }

    const shouldSet = arr === undefined;
    arr ??= [];
    arr.push(value);
    if (shouldSet) map.set(key, arr);
}

export function getFileName(uri: FtlUri | FtlTextDocument | string): string {
    if (typeof uri === 'object' && 'uri' in uri) uri = uri.uri;
    if (typeof uri !== 'string') uri = uri.path;
    return uri.slice(uri.lastIndexOf('/') + 1);
}

export function shouldCompleteForNodeContents(
    node: Node,
    offset: number): node is Node & { startTagEnd: number, endTagStart: number } {
    if (typeof node.startTagEnd === 'undefined' || typeof node.endTagStart === 'undefined') return false;
    const startTagEnd = node.startTagEnd;
    const endTagStart = node.endTagStart;

    return startTagEnd <= offset && endTagStart >= offset;
}

export function findRecursiveLoop(
    startingName: string,
    children: Iterable<string>,
    lookupChildren: (name: string) => Iterable<string> | undefined,
    seenNames = new Set<string>()): string[] | undefined {
    for (const childName of children) {
        if (childName == startingName) return [];
        // we're in a loop, but it doesn't include the starting name, so we're going to bail out before we crash
        if (seenNames.has(childName)) return undefined;
        seenNames.add(childName);
        const childChildren = lookupChildren(childName);
        if (!childChildren) continue;
        const result = findRecursiveLoop(startingName, childChildren, lookupChildren, seenNames);
        if (result) {
            result.unshift(childName);
            return result;
        }
    }
}

export function filterFalsy<T>(array: Array<T | undefined | null>): T[] {
    return array.filter((t): t is T => !!t);
}
