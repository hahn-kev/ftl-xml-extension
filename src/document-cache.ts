import {HTMLDocument, LanguageService, TextDocument as HtmlTextDocument} from 'vscode-html-languageservice';
import {TextDocument} from 'vscode';

export class DocumentCache {
    cache = new Map<string, { doc: HTMLDocument, version: number }>();

    constructor(private service: LanguageService) {
    }

    getHtmlDocument(document: HtmlTextDocument | TextDocument): HTMLDocument {
        let correctDoc: HtmlTextDocument;
        let documentKey = document.uri.toString();
        let cachedValue = this.cache.get(documentKey);
        if (cachedValue && cachedValue.version == document.version) return cachedValue.doc;
        correctDoc = {...document, uri: document.uri.toString()};
        let htmlDoc = this.service.parseHTMLDocument(correctDoc);
        this.cache.set(documentKey, {doc: htmlDoc, version: document.version});
        return htmlDoc;
    }
}
