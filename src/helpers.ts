import {MarkupContent, Node, Range as HtmlRange, TextDocument as HtmlTextDocument} from 'vscode-html-languageservice';
import {MarkdownString, Position, Range, TextDocument, Uri} from 'vscode';

export function toTextDocumentHtml(d: TextDocument): HtmlTextDocument {
    return {...d, uri: d.uri.toString()};
}

export function convertDocumentation(documentation: string | MarkupContent | undefined): string | MarkdownString | undefined {
    if (typeof documentation === 'object' && 'kind' in documentation) {
        if (documentation.kind == 'markdown') {
            return new MarkdownString(documentation.value);
        }
        return documentation.value;
    }
    return documentation;
}

export function hasAncestor(node: Node, name: string, includeSelf: boolean): boolean {
    if (!node.tag) return  false;
    if (includeSelf && node.tag == name) return true;
    if (!node.parent) return false;
    return hasAncestor(node.parent, name, true);
}

export function getNodeTextContent(node: Node, document: TextDocument, whenTagName?: string) {
    if (node.startTagEnd === undefined || node.endTagStart === undefined) return undefined;
    if (typeof whenTagName === 'string' && node.tag !== whenTagName) return undefined;
    return document.getText(toRange(node.startTagEnd, node.endTagStart, document));
}

export function toRange(start: number, end: number, document: TextDocument) {
    return new Range(document.positionAt(start), document.positionAt(end));
}

export function convertRange(range: HtmlRange): Range {
    let start = range.start;
    let end = range.end;
    return new Range(new Position(start.line, start.character), new Position(end.line, end.character));
}

export function normalizeAttributeName(attr: string | null | undefined): string | undefined {
    return attr?.slice(1, -1);
}

export function getAttrValueForTag(node: Node, tagName: string, attrName: string, document?: TextDocument, atPosition?: Position): string | undefined {
    if (node.tag == tagName && hasAttr(node, attrName, document, atPosition))
        return normalizeAttributeName(node.attributes[attrName]);
}

export function hasAttr<T extends string>(node: Node, name: T, document?: TextDocument, atPosition?: Position): node is Node & { attributes: Record<T, string> } {
    if (!node.attributes) return false;
    if (!(name in node.attributes)) return false;
    if (document && atPosition) {
        return isInAttrValue(node, document, name, atPosition);
    }
    return true;
}

export function isInAttrValue(node: Node, document: TextDocument, attrName: string, position: Position): boolean {
    let startPosition = document.positionAt(node.start);
    let textRange = new Range(
        startPosition,
        document.positionAt(node.startTagEnd ?? node.end)
    );
    let text = document.getText(textRange);
    let nameRange = attrNameRange(node, document, position);
    if (!nameRange) return false;
    let attrStart = document.offsetAt(nameRange.start) - node.start;
    let attrEnd = document.offsetAt(nameRange.end) - node.start

    let foundAttrName = text.substring(attrStart, attrEnd);
    return foundAttrName === attrName;
}

export function attrNameRange(node: Node,
                              document: TextDocument,
                              position: Position): Range | undefined {
    let startPosition = document.positionAt(node.start);
    let textRange = new Range(
        startPosition,
        document.positionAt(node.startTagEnd ?? node.end)
    );
    let text = document.getText(textRange);
    let positionOffset = document.offsetAt(position);

    if (positionOffset < node.start || (node.startTagEnd ?? node.end) < positionOffset) return;
    let cursorOffsetInText = positionOffset - node.start;

    let attrEnd: number | undefined;
    let attrStart: number | undefined;
    for (let i = cursorOffsetInText; i > 0; i--) {
        if (attrEnd === undefined) {
            if (text.charAt(i) != '"') continue;
            i--;
            if (text.charAt(i) != '=') continue;
            attrEnd = i;
        }
        //we've found =" keep going to get the attribute name
        if (text.charAt(i) == ' ') {
            attrStart = i + 1;
            break;
        }
    }
    if (attrEnd === undefined || attrStart === undefined) return;
    return toRange(node.start + attrStart, node.start + attrEnd, document);
}

export function firstWhere<T, R>(list: T[], map: (value: T) => R) {
    for (let value of list) {
        let mapped = map(value);
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

    let shouldSet = arr === undefined;
    arr ??= [];
    arr.push(value);
    if (shouldSet) map.set(key, arr);
}

export function maxBy<T>(arr: T[], map: (value: T) => number) {

}

export function fileName(uri: Uri|TextDocument): string | undefined {
    if ('uri' in uri) uri = uri.uri;
    return uri.path.split('/').pop();
}
