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
import {DocumentCache} from './document-cache';
import {mappers} from './ref-mappers/mappers';

export class FtlReferenceProvider implements ReferenceProvider {
    constructor(private documentCache: DocumentCache) {
    }

    provideReferences(document: TextDocument, position: Position, context: ReferenceContext, token: CancellationToken): ProviderResult<Location[]> {
        let htmlDocument = this.documentCache.getHtmlDocument(document);
        const offset = document.offsetAt(position);
        const node = htmlDocument.findNodeBefore(offset);
        for (let mapper of mappers) {
            let refs = mapper.lookupRefs(node, document, position);
            if (refs) return refs;
        }
    }
}
