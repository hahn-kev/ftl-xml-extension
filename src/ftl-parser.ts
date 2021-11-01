import {ProgressLocation, TextDocument, Uri, window, workspace} from 'vscode';
import {LanguageService, Node} from 'vscode-html-languageservice';
import {FtlFile} from './ftl-file';
import {
    getEventNameDef, getEventRefName
} from './helpers';
import {DocumentCache} from './document-cache';
import {FtlEvent} from './ftl-event';
import {Emitter} from 'vscode-languageclient';

export class FtlParser {
    constructor(private cache: DocumentCache) {
    }

    private _onFileParsedEmitter = new Emitter<{ file: FtlFile, files: Map<string, FtlFile> }>();

    public get onFileParsed() {
        return this._onFileParsedEmitter.event;
    }

    public files = new Map<string, FtlFile>();

    public async parseCurrentWorkspace() {
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

    private async parseFiles(files: Uri[]) {
        for (let file of files) {
            let document = await workspace.openTextDocument(file);
            this.parseFile(file, document);
        }
    }

    public parseFile(uri: Uri, document: TextDocument) {
        let ftlFile: FtlFile = {
            uri: uri,
            events: [],
            eventRefs: new Map<string, FtlEvent[]>()
        };
        this.files.set(ftlFile.uri.toString(), ftlFile);

        let htmlDocument = this.cache.getHtmlDocument(document);
        this.parseNodes(htmlDocument.roots, ftlFile, document);

        this._onFileParsedEmitter.fire({file:ftlFile, files: this.files});
    }

    private parseNodes(nodes: Node[], ftlFile: FtlFile, document: TextDocument) {
        for (let node of nodes) {
            let nameDef = getEventNameDef(node);
            if (nameDef) {
                ftlFile.events.push(this.toEvent(nameDef, node, document, ftlFile));
                this.addRef(nameDef, node, document, ftlFile);
            }
            if (!nameDef) {
                let nameRef = getEventRefName(node, document);
                if (nameRef) {
                    this.addRef(nameRef, node, document, ftlFile);
                }
            }

            this.parseNodes(node.children, ftlFile, document);
        }
    }

    private addRef(eventName: string, node: Node, document: TextDocument, ftlFile: FtlFile) {
        let refs = ftlFile.eventRefs.get(eventName);
        let shouldSet = refs == undefined;
        refs ??= [];
        refs.push(this.toEvent(eventName, node, document, ftlFile));
        if (shouldSet) ftlFile.eventRefs.set(eventName, refs);
    }

    private toEvent(eventName: string, node: Node, document: TextDocument, ftlFile: FtlFile): FtlEvent {
        return {
            name: eventName,
            file: ftlFile,
            offset: node.start,
            position: document.positionAt(node.start)
        };
    }
}
