import {
    MarkupContent,
    Range as HtmlRange,
    TextDocument as HtmlTextDocument
} from "vscode-html-languageservice";
import {Location, MarkdownString, Position, Range, TextDocument} from "vscode";
import {FtlShip} from './models/ftl-ship';
import {FtlEvent} from './models/ftl-event';


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

export function toRange(start: number, end: number, document: TextDocument) {
    return new Range(document.positionAt(start), document.positionAt(end));
}

export function toLocation(value: FtlShip | FtlEvent) {
    return new Location(value.file.uri, new Position(value.position.line, value.position.character));
}

export function convertRange(range: HtmlRange): Range {
    let start = range.start;
    let end = range.end;
    return new Range(new Position(start.line, start.character), new Position(end.line, end.character));
}

export function normalizeAttributeName(attr: string | null | undefined) {
    return attr?.slice(1, -1);
}

export function addToKey<T, Key>(map: Map<Key, T[]>, key: Key, value: T) {
    let arr = map.get(key);
    let shouldSet = arr === undefined;
    arr ??= [];
    arr.push(value);
    if (shouldSet) map.set(key, arr);
}
