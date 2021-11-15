import {ProgressLocation, TextDocument, Uri, window, workspace} from 'vscode';
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
        this.files.clear();
        let prefix = subFolder ? `${subFolder}/` : '';
        let files = await workspace.findFiles(prefix + '**/*.{xml,xml.append}');
        if (files.length > 0)
            await this.parseFiles(files);

        return this.files;
    }

    public async parseFiles(files: Uri[]) {
        if (files.length == 0) return;

        console.time('parse files');
        await window.withProgress({
            title: 'Parsing FTL files',
            location: ProgressLocation.Window
        }, async (progress, token) => {
            for (let file of files) {
                let document = await workspace.openTextDocument(file);
                this._parseFile(document);
            }
        });

        console.timeEnd('parse files');
        this._onFileParsedEmitter.fire({files: this.files});
    }

    public parseFile(document: TextDocument) {
        this._parseFile(document);
        this._onFileParsedEmitter.fire({files: this.files});
    }

    private _parseFile(document: TextDocument) {
        let ftlFile: FtlFile = new FtlFile(document.uri);
        this.files.set(ftlFile.uri.toString(), ftlFile);

        let htmlDocument = this.cache.getHtmlDocument(document);
        this.parseNodes(htmlDocument.roots, ftlFile, document);
    }

    private parseNodes(nodes: Node[], ftlFile: FtlFile, document: TextDocument) {
        for (let node of nodes) {
            for (let mapper of this.mappers) {
                mapper.parseNode(node, ftlFile, document);
            }
            // this.visitNode(node, document);

            this.parseNodes(node.children, ftlFile, document);
        }
    }

    systemTags = new Set<string>();
    private visitNode(node: Node, document: TextDocument) {
        if (node.tag && node.attributes && 'system' in node.attributes) {
            this.systemTags.add(node.tag);
        }
    }
}
