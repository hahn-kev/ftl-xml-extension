import {ProgressLocation, Uri, window, workspace} from 'vscode';
import {TextDocument} from 'vscode-languageserver-textdocument';
import {LanguageService, Node} from 'vscode-html-languageservice';
import {FtlFile} from './ftl-file';

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
            this.parseFile(file, {...document, uri: file.toString()});
        }
    }

    parseFile(uri: Uri, document: TextDocument) {
        let ftlFile: FtlFile = {uri: uri.toString(), events: []};
        this.files.set(ftlFile.uri, ftlFile);

        let htmlDocument = this.service.parseHTMLDocument(document);
        this.parseNodes(htmlDocument.roots, ftlFile);
    }

    parseNodes(nodes: Node[], ftlFile: FtlFile) {
        for (let node of nodes) {
            if (node.tag == 'event' && node.attributes && 'name' in node.attributes) {
                ftlFile.events.push({
                    name: node.attributes.name.slice(1, -1),
                    documentIndex: node.start
                });
            }
            this.parseNodes(node.children, ftlFile);
        }
    }
}
