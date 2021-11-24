import {HTMLDocument, LanguageService, TextDocument as HtmlTextDocument} from 'vscode-html-languageservice';
import {TextDocument} from 'vscode';

export class DocumentCache {
  cache = new Map<string, { doc: HTMLDocument, version: number }>();

  constructor(private service: LanguageService) {
  }

  getHtmlDocument(document: HtmlTextDocument | TextDocument): HTMLDocument {
    const documentKey = document.uri.toString();
    const cachedValue = this.cache.get(documentKey);
    if (cachedValue && cachedValue.version == document.version) return cachedValue.doc;
    const correctDoc: HtmlTextDocument = {...document, uri: document.uri.toString()};
    const htmlDoc = this.service.parseHTMLDocument(correctDoc);
    this.cache.set(documentKey, {doc: htmlDoc, version: document.version});
    return htmlDoc;
  }
}
