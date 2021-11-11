import {
    CancellationToken,
    Location,
    Position,
    ProviderResult,
    ReferenceContext,
    ReferenceProvider,
    TextDocument
} from 'vscode';
import {DocumentCache} from './document-cache';
import {RefMapperBase} from './ref-mappers/ref-mapper';

export class FtlReferenceProvider implements ReferenceProvider {
    constructor(private documentCache: DocumentCache, private mappers: RefMapperBase[]) {
    }

    provideReferences(document: TextDocument, position: Position, context: ReferenceContext, token: CancellationToken): ProviderResult<Location[]> {
        let htmlDocument = this.documentCache.getHtmlDocument(document);
        const offset = document.offsetAt(position);
        const node = htmlDocument.findNodeBefore(offset);
        for (let mapper of this.mappers) {
            let refs = mapper.lookupRefs(node, document, position);
            if (refs) return refs;
        }
    }
}
