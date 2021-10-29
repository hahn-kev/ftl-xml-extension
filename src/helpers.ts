import {
    MarkupContent,
    Node,
    TextDocument as HtmlTextDocument,
    Range as HtmlRange
} from "vscode-html-languageservice";
import {
    MarkdownString,
    Position,
    Range,
    TextDocument
} from "vscode";


export function toTextDocumentHtml(d: TextDocument): HtmlTextDocument {
    return {...d, uri: d.uri.toString()};
}

export function normalizeEventName(attr: string | null | undefined) {
    return attr?.slice(1, -1);
}

export function getLoadEventName(node: Node, document: TextDocument) {
    if (node.startTagEnd === undefined || node.endTagStart === undefined) return undefined;
    return document.getText(new Range(document.positionAt(node.startTagEnd), document.positionAt(node.endTagStart)));
}

export function isLoadEvent(node: Node) {
    return node.tag == "loadEvent";
}

export function inLoadAttribute(node: Node): boolean {
    if (!node.attributes || !('load' in node.attributes))
        return false;
    return true;
}

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

export function getEventName(node: Node, document: TextDocument): string | undefined {
    return getEventRefName(node, document) ?? getEventNameDef(node);
}

export function getEventNameDef(node: Node): string | undefined {
    if ((node.tag == 'eventList' || node.tag == 'event') && node.attributes && 'name' in node.attributes && node.parent?.tag != 'sectorDescription')
        return normalizeEventName(node.attributes.name);
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

export function convertRange(range: HtmlRange): Range {
    let start = range.start;
    let end = range.end;
    return new Range(new Position(start.line, start.character), new Position(end.line, end.character));
}
