import {
    CancellationToken,
    Definition,
    DefinitionLink,
    DefinitionProvider, Event,
    Location,
    Position,
    ProviderResult,
    TextDocument
} from 'vscode';
import {LanguageService} from 'vscode-html-languageservice';
import {getEventName, toTextDocumentHtml} from './helpers';
import {FtlFile} from './ftl-file';
import {FtlEvent} from './ftl-event';

export class FtlDefinitionProvider implements DefinitionProvider {
    events = new Map<string, FtlEvent>();

    constructor(private service: LanguageService, onFileParsed: Event<{ file: FtlFile; files: Map<string, FtlFile> }>) {
        onFileParsed(e => {
            this.events.clear();
            this.loadFiles(e.files);
        });
    }

    provideDefinition(document: TextDocument, position: Position, token: CancellationToken): ProviderResult<Definition | DefinitionLink[]> {
        let htmlDocument = this.service.parseHTMLDocument(toTextDocumentHtml(document));
        const offset = document.offsetAt(position);
        const node = htmlDocument.findNodeBefore(offset);

        let eventName = getEventName(node, document);
        if (!eventName) {
            return null;
        }
        let event = this.events.get(eventName);
        if (event) {
            return new Location(event.file.uri, new Position(event.position.line, event.position.character))
        }
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
    }
}
