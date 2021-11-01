import {
    CancellationToken,
    Event,
    Location,
    Position,
    ProviderResult,
    ReferenceContext,
    ReferenceProvider,
    TextDocument
} from 'vscode';
import {FtlEvent} from './models/ftl-event';
import {DocumentCache} from './document-cache';
import {FtlFile} from './models/ftl-file';
import {events} from './events';
import {addToKey, toLocation} from './helpers';
import {FtlShip} from './models/ftl-ship';
import {Node} from 'vscode-html-languageservice';
import {ships} from './ships';

export class FtlReferenceProvider implements ReferenceProvider {
    constructor(private documentCache: DocumentCache, onFileParsed: Event<{ file: FtlFile; files: Map<string, FtlFile> }>) {
        onFileParsed(e => {
            this.eventRefs.clear();
            this.shipRefs.clear();
            for (let file of e.files.values()) {
                file.eventRefs.forEach((events, key) => addToKey(this.eventRefs, key, events));
                file.shipRefs.forEach((ships, key) => addToKey(this.shipRefs, key, ships));
            }
        });
    }


    private eventRefs = new Map<string, FtlEvent[]>();
    private shipRefs = new Map<string, FtlShip[]>();

    provideReferences(document: TextDocument, position: Position, context: ReferenceContext, token: CancellationToken): ProviderResult<Location[]> {
        let htmlDocument = this.documentCache.getHtmlDocument(document);
        const offset = document.offsetAt(position);
        const node = htmlDocument.findNodeBefore(offset);

        return this.provideShipRefs(node) ?? new Promise(resolve => {
            resolve(this.provideEventRefs(node, document));
        });
    }

    private provideEventRefs(node: Node, document: TextDocument): Location[] | undefined {
        let eventName = events.getEventName(node, document);
        if (!eventName) return;
        let ftlEvents = this.eventRefs.get(eventName);
        if (ftlEvents && ftlEvents.length > 10_000) ftlEvents = ftlEvents.slice(0, 10_000);
        return ftlEvents?.map(toLocation);
    }

    private provideShipRefs(node: Node): Location[] | undefined {
        let shipName = ships.getNameDef(node) ?? ships.getRefName(node);
        if (!shipName) return;
        let ftlShips = this.shipRefs.get(shipName);
        return ftlShips?.map(toLocation);
    }
}
