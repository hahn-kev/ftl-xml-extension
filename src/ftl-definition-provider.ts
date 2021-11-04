import {
    CancellationToken,
    Definition,
    DefinitionLink,
    DefinitionProvider,
    Position,
    ProviderResult,
    TextDocument
} from 'vscode';
import {DocumentCache} from './document-cache';
import {RefMapperBase} from './ref-mappers/ref-mapper';

export class FtlDefinitionProvider implements DefinitionProvider {


    constructor(private documentCache: DocumentCache, private mappers: RefMapperBase[]) {

    }

    provideDefinition(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Definition | DefinitionLink[]> {
        let htmlDocument = this.documentCache.getHtmlDocument(document);
        const offset = document.offsetAt(position);
        const node = htmlDocument.findNodeBefore(offset);
        for (let mapper of this.mappers) {
            let def = mapper.lookupDef(node, document, position);
            if (def) return def;
        }
    }
}
