import {HTMLDocument, LanguageService, TextDocument as HtmlTextDocument} from 'vscode-html-languageservice';
import {URI} from 'vscode-uri';
import {FtlTextDocument} from './models/ftl-text-document';

export class DocumentCache {
  private cache = new Map<string, { doc: HTMLDocument, version: number }>();

  constructor(private service: LanguageService) {
  }

  getHtmlDocument(document: FtlTextDocument): HTMLDocument {
    const documentKey = document.uri.toString();
    const cachedValue = this.cache.get(documentKey);
    if (cachedValue && cachedValue.version == document.version) return cachedValue.doc;
    const correctDoc = HtmlTextDocument.create(document.uri.toString(),
        document.languageId,
        document.version,
        document.getText());
    const htmlDoc = this.service.parseHTMLDocument(correctDoc);
    this.cache.set(documentKey, {doc: htmlDoc, version: document.version});
    return htmlDoc;
  }

  fileRemoved(uri: URI) {
    const documentKey = uri.toString();
    this.cache.delete(documentKey);
  }

  clearCache() {
    this.cache.clear();
  }
}
