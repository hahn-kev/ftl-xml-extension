import {
    ProgressLocation,
    TextDocument,
    Uri,
    window,
    workspace
} from 'vscode';
import {Node} from 'vscode-html-languageservice';
import {FtlFile} from './models/ftl-file';
import {DocumentCache} from './document-cache';
import {Emitter} from 'vscode-languageclient';
import {RefMapperBase} from './ref-mappers/ref-mapper';

export class FtlParser {
    constructor(private cache: DocumentCache, private mappers: RefMapperBase[]) {
    }

    private _onFileParsedEmitter = new Emitter<{ files: Map<string, FtlFile> }>();

    public get onFileParsed() {
        return this._onFileParsedEmitter.event;
    }

    public files = new Map<string, FtlFile>();

    public async parseCurrentWorkspace(subFolder?: string) {
        let prefix = subFolder ? `${subFolder}/` : '';
        let files = await workspace.findFiles(prefix + '**/*.{xml,xml.append}');
        if (files.length > 0)
            await window.withProgress({
                title: 'Parsing FTL files',
                location: ProgressLocation.Window
            }, async (progress, token) => {
                await this.parseFiles(files);
            });
        return this.files;
    }

    private async parseFiles(files: Uri[]) {
        if (files.length == 0) return;
        for (let file of files) {
            let document = await workspace.openTextDocument(file);
            this.parseFile(file, document);
        }
    }

    public parseFile(uri: Uri, document: TextDocument) {
        this._parseFile(uri, document);
        this._onFileParsedEmitter.fire({files: this.files});
    }

    private _parseFile(uri: Uri, document: TextDocument) {
        let ftlFile: FtlFile = new FtlFile(uri);
        this.files.set(ftlFile.uri.toString(), ftlFile);

        let htmlDocument = this.cache.getHtmlDocument(document);
        this.parseNodes(htmlDocument.roots, ftlFile, document);
    }

    private parseNodes(nodes: Node[], ftlFile: FtlFile, document: TextDocument) {
        for (let node of nodes) {
            for (let mapper of this.mappers) {
                mapper.parseNode(node, ftlFile, document);
            }


            this.parseNodes(node.children, ftlFile, document);
        }
    }
}
