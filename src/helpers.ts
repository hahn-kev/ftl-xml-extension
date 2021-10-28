import {TextDocument as HtmlTextDocument} from "vscode-html-languageservice";
import {TextDocument} from "vscode";


export function toTextDocumentHtml(d: TextDocument): HtmlTextDocument {
    return {...d, uri: d.uri.toString()};
}

export function normalizeEventName(attr: string) {

    return attr.slice(1, -1);
}
