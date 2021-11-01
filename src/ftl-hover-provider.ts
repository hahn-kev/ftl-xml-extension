import {
    CancellationToken, Hover,
    HoverProvider, MarkdownString,
    Position,
    ProviderResult,
    TextDocument
} from 'vscode';
import {DocumentCache} from './document-cache';
import {LanguageService, TextDocument as HtmlTextDocument} from 'vscode-html-languageservice';
import {
    convertDocumentation,
    convertRange,
    toTextDocumentHtml
} from './helpers';

export class FtlHoverProvider implements HoverProvider {
    constructor(private documentCache: DocumentCache, private service: LanguageService) {

    }

    provideHover(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Hover> {
        //the document from vscode will not accept range objects created inside
        //the html language service, so we must do this
        let textDocument = HtmlTextDocument.create(document.uri.toString(), document.languageId, document.version, document.getText());

        let hover = this.service.doHover(textDocument, position, this.documentCache.getHtmlDocument(document), {documentation: true});
        if (!hover || !hover.range || hover.contents === '') return null;
        let documentation: string | MarkdownString | undefined;
        if (typeof hover.contents === 'object' && 'kind' in hover.contents) {
            documentation = convertDocumentation(hover.contents);
        }
        if (!documentation) return null;
        return {
            range: convertRange(hover.range),
            contents: [documentation]
        };
    }

}
