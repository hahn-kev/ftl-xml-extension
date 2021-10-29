import {
    CancellationToken, Location, Position, ProviderResult,
    ReferenceContext,
    ReferenceProvider,
    TextDocument
} from 'vscode';
import {FtlEvent} from './ftl-event';
import {DocumentCache} from './document-cache';
import {getEventName} from './helpers';

export class FtlReferenceProvider implements ReferenceProvider {
    constructor(private documentCache: DocumentCache) {

    }


    public eventRefs = new Map<string, FtlEvent[]>();

    provideReferences(document: TextDocument, position: Position, context: ReferenceContext, token: CancellationToken): ProviderResult<Location[]> {
        let htmlDocument = this.documentCache.getHtmlDocument(document);
        const offset = document.offsetAt(position);
        const node = htmlDocument.findNodeBefore(offset);

        let eventName = getEventName(node, document);
        if (!eventName) {
            return;
        }
        let ftlEvents = this.eventRefs.get(eventName);
        if (!ftlEvents) return ;
        return ftlEvents.map(value => new Location(value.file.uri, new Position(value.position.line, value.position.character)));
    }

}
