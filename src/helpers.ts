import {
    MarkupContent, Node,
    Range as HtmlRange,
    TextDocument as HtmlTextDocument
} from "vscode-html-languageservice";
import {MarkdownString, Position, Range, TextDocument} from "vscode";


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

export function getNodeTextContent(node: Node, document: TextDocument) {
    if (node.startTagEnd === undefined || node.endTagStart === undefined) return undefined;
    return document.getText(new Range(document.positionAt(node.startTagEnd), document.positionAt(node.endTagStart)));
}

export function toRange(start: number, end: number, document: TextDocument) {
    return new Range(document.positionAt(start), document.positionAt(end));
}

export function convertRange(range: HtmlRange): Range {
    let start = range.start;
    let end = range.end;
    return new Range(new Position(start.line, start.character), new Position(end.line, end.character));
}

export function normalizeAttributeName(attr: string | null | undefined) {
    return attr?.slice(1, -1);
}

export function getAttrValueForTag(node: Node, tagName: string, attrName: string): string | undefined {
    if (node.tag == tagName && node.attributes && attrName in node.attributes)
        return normalizeAttributeName(node.attributes[attrName]);
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
