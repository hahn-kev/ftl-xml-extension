import {
    HTMLDocument,
    LanguageService,
    TextDocument as HtmlTextDocument
} from 'vscode-html-languageservice';
import {TextDocument} from 'vscode';

export class DocumentCache {
    cache = new Map<string, HTMLDocument>();

    constructor(private service: LanguageService) {
    }

    getHtmlDocument(document: HtmlTextDocument | TextDocument): HTMLDocument {
        let correctDoc: HtmlTextDocument;
        let uri = document.uri.toString();
        let htmlDoc = this.cache.get(uri);
        if (htmlDoc) return htmlDoc;
        correctDoc = {...document, uri: document.uri.toString()};
        htmlDoc = this.service.parseHTMLDocument(correctDoc);
        this.cache.set(uri, htmlDoc);
        return htmlDoc;
    }
}
