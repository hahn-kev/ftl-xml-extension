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
import {mappers} from './ref-mappers/ref-mapper';

export class FtlDefinitionProvider implements DefinitionProvider {


    constructor(private documentCache: DocumentCache, onFileParsed: Event<{ file: FtlFile; files: Map<string, FtlFile> }>) {

    }

    provideDefinition(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Definition | DefinitionLink[]> {
        let htmlDocument = this.documentCache.getHtmlDocument(document);
        const offset = document.offsetAt(position);
        const node = htmlDocument.findNodeBefore(offset);
        for (let mapper of mappers) {
            let def = mapper.lookupDef(node, document);
            if (def) return def;
        }
    }
}
