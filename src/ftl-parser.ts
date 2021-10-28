import {ProgressLocation, Uri, window, workspace} from 'vscode';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {LanguageService, Node} from 'vscode-html-languageservice';
import {FtlFile} from './ftl-file';
import {normalizeEventName, toTextDocumentHtml} from './helpers';

export class FtlParser {
    constructor(private service: LanguageService) {
    }

    files = new Map<string, FtlFile>();

    async parseCurrentWorkspace() {
        let files = await workspace.findFiles('**/*.{xml,xml.append}');
        if (files.length > 0)
            await window.withProgress({
                title: 'Parsing FTL files',
                location: ProgressLocation.Window
            }, async (progress, token) => {
                await this.parseFiles(files);
            });
        return this.files;
    }

    async parseFiles(files: Uri[]) {
        for (let file of files) {
            let document = await workspace.openTextDocument(file);
            this.parseFile(file, toTextDocumentHtml(document));
        }
    }

    parseFile(uri: Uri, document: TextDocument) {
        let ftlFile: FtlFile = {uri: uri, events: []};
        this.files.set(ftlFile.uri.toString(), ftlFile);

        let htmlDocument = this.service.parseHTMLDocument(document);
        this.parseNodes(htmlDocument.roots, ftlFile, document);
    }

    parseNodes(nodes: Node[], ftlFile: FtlFile, document: TextDocument) {
        for (let node of nodes) {
            if (node.tag == 'event' && node.attributes && 'name' in node.attributes) {
                ftlFile.events.push({
                    file: ftlFile,
                    name: normalizeEventName(node.attributes.name),
                    offset: node.start,
                    position: document.positionAt(node.start)
                });
            }
            this.parseNodes(node.children, ftlFile, document);
        }
    }
}
