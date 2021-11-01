import {
    CancellationToken,
    Definition,
    DefinitionLink,
    DefinitionProvider,
    Event,
    Location,
    Position,
    ProviderResult,
    TextDocument
} from 'vscode';
import {LanguageService, Node} from 'vscode-html-languageservice';
import {toLocation, toTextDocumentHtml} from './helpers';
import {FtlFile} from './models/ftl-file';
import {FtlEvent} from './models/ftl-event';
import {events} from './events';
import {FtlShip} from './models/ftl-ship';
import {ships} from './ships';
import {DocumentCache} from './document-cache';

export class FtlDefinitionProvider implements DefinitionProvider {
    events = new Map<string, FtlEvent>();
    ships = new Map<string, FtlShip>();

    constructor(private documentCache: DocumentCache, onFileParsed: Event<{ file: FtlFile; files: Map<string, FtlFile> }>) {
        onFileParsed(e => {
            this.events.clear();
            this.ships.clear();
            this.loadFiles(e.files);
        });
    }

    provideDefinition(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Definition | DefinitionLink[]> {
        let htmlDocument = this.documentCache.getHtmlDocument(document);
        const offset = document.offsetAt(position);
        const node = htmlDocument.findNodeBefore(offset);

        return this.provideShipDefinition(node) ?? this.provideEventDefinition(node, document);
    }

    private provideEventDefinition(node: Node, document: TextDocument) {
        let eventName = events.getEventName(node, document);
        if (!eventName) return undefined;

        let event = this.events.get(eventName);
        if (event) return toLocation(event);
    }

    private provideShipDefinition(node: Node) {
        let shipName = ships.getNameDef(node) ?? ships.getRefName(node);
        if (!shipName) return undefined;

        let ship = this.ships.get(shipName);
        if (ship) return toLocation(ship);
    }

    loadFiles(files: Map<string, FtlFile>) {
        for (let file of files.values()) {
            this.loadFile(file);
        }
    }

    loadFile(file: FtlFile) {
        for (let event of file.events) {
            this.events.set(event.name, event);
        }
        for (let ship of file.ships) {
            this.ships.set(ship.name, ship);
        }
    }
}
