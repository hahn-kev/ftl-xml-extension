import {ProgressLocation, TextDocument, Uri, window, workspace} from 'vscode';
import {Node} from 'vscode-html-languageservice';
import {FtlFile} from './models/ftl-file';
import {DocumentCache} from './document-cache';
import {FtlEvent} from './models/ftl-event';
import {Emitter} from 'vscode-languageclient';
import {events} from './events';
import {FtlShip} from './models/ftl-ship';
import {addToKey} from './helpers';
import {ships} from './ships';

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
            eventRefs: new Map<string, FtlEvent[]>(),
            ships: [],
            shipRefs: new Map<string, FtlShip[]>(),
        };
        this.files.set(ftlFile.uri.toString(), ftlFile);

        let htmlDocument = this.cache.getHtmlDocument(document);
        this.parseNodes(htmlDocument.roots, ftlFile, document);

        this._onFileParsedEmitter.fire({file: ftlFile, files: this.files});
    }

    private parseNodes(nodes: Node[], ftlFile: FtlFile, document: TextDocument) {
        for (let node of nodes) {
            this.parseEvent(node, ftlFile, document);
            this.parseShip(node, ftlFile, document);


            this.parseNodes(node.children, ftlFile, document);
        }
    }

    private parseEvent(node: Node, ftlFile: FtlFile, document: TextDocument) {
        let nameDef = events.getEventNameDef(node);
        if (nameDef) {
            let ftlEvent = new FtlEvent(nameDef, ftlFile, node, document);
            ftlFile.events.push(ftlEvent);
            addToKey(ftlFile.eventRefs, nameDef, ftlEvent);
        } else {
            let nameRef = events.getEventRefName(node, document);
            if (nameRef) {
                addToKey(ftlFile.eventRefs, nameRef, new FtlEvent(nameRef, ftlFile, node, document));
            }
        }
    }

    private parseShip(node: Node, ftlFile: FtlFile, document: TextDocument) {
        let nameDef = ships.getNameDef(node);
        if (nameDef) {
            let ship = new FtlShip(nameDef, ftlFile, node, document);
            ftlFile.ships.push(ship);
            addToKey(ftlFile.shipRefs, nameDef, ship);
        } else {
            let refName = ships.getRefName(node);
            if (refName) {
                addToKey(ftlFile.shipRefs, refName, new FtlShip(refName, ftlFile, node, document));
            }
        }
    }
}
