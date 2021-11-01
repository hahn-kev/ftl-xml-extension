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

export class FtlReferenceProvider implements ReferenceProvider {
    constructor(private documentCache: DocumentCache, onFileParsed: Event<{ file: FtlFile; files: Map<string, FtlFile> }>) {
        onFileParsed(e => {
            let map = new Map<string, FtlEvent[]>()
            for (let file of e.files.values()) {
                file.eventRefs.forEach((events, key) => {
                    let currentEventsList = map.get(key);
                    if (currentEventsList)
                        currentEventsList.push(...events);
                    else
                        map.set(key, events);
                });
            }
            this.eventRefs = map;
        });
    }


    private eventRefs = new Map<string, FtlEvent[]>();

    provideReferences(document: TextDocument, position: Position, context: ReferenceContext, token: CancellationToken): ProviderResult<Location[]> {
        let htmlDocument = this.documentCache.getHtmlDocument(document);
        const offset = document.offsetAt(position);
        const node = htmlDocument.findNodeBefore(offset);

        let eventName = events.getEventName(node, document);
        if (!eventName) {
            return;
        }
        let ftlEvents = this.eventRefs.get(eventName);
        if (!ftlEvents) return;
        return ftlEvents.map(value => new Location(value.file.uri, new Position(value.position.line, value.position.character)));
    }

}
