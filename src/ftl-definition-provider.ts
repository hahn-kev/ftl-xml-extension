import {
    CancellationToken,
    Definition,
    DefinitionLink,
    DefinitionProvider,
    Location,
    Position,
    ProviderResult,
    TextDocument
} from 'vscode';
import {LanguageService} from 'vscode-html-languageservice';
import {getEventName, getEventRefName, toTextDocumentHtml} from './helpers';
import {FtlFile} from './ftl-file';
import {FtlEvent} from './ftl-event';

export class FtlDefinitionProvider implements DefinitionProvider {
    events = new Map<string, FtlEvent>();

    constructor(private service: LanguageService) {

    }

    provideDefinition(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Definition | DefinitionLink[]> {
        let htmlDocument = this.service.parseHTMLDocument(toTextDocumentHtml(document));
        const offset = document.offsetAt(position);
        const node = htmlDocument.findNodeBefore(offset);

        let eventName = getEventName(node, document);
        let event = this.events.get(eventName);
        if (event) {
            return new Location(event.file.uri, new Position(event.position.line, event.position.character))
        }
        return null;
    }
    loadFiles(files: Map<string, FtlFile>) {
        for (let file of files.values()) {
            for (let event of file.events) {
                this.events.set(event.name, event);
            }
        }
    }
}
