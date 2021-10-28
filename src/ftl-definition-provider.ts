import {
    CancellationToken, Definition, DefinitionLink,
    DefinitionProvider, Location,
    Position, ProviderResult, Range,
    TextDocument
} from 'vscode';
import {LanguageService, Node} from 'vscode-html-languageservice';
import {normalizeEventName, toTextDocumentHtml} from './helpers';
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
        let eventName: string;
        if (this.inLoadAttribute(node)) {
            eventName = normalizeEventName(node.attributes.load);
        }
        if (this.inEventLoad(node)) {
            let tmp = document.getText(new Range(document.positionAt(node.startTagEnd), document.positionAt(node.endTagStart)));
            eventName = tmp;
        }
        let event = this.findEvent(eventName);
        if (event) {
            return new Location(event.file.uri, new Position(event.position.line, event.position.character))
        }
        return null;
    }

    findEvent(eventName: string): FtlEvent | undefined {
        return this.events.get(eventName);
    }

    inLoadAttribute(node: Node): boolean {
        if (!node.attributes || !('load' in node.attributes))
            return false;
        return true;
    }

    loadFiles(files: Map<string, FtlFile>) {
        for (let file of files.values()) {
            for (let event of file.events) {
                this.events.set(event.name, event);
            }
        }
    }

    private inEventLoad(node: Node) {
        return node.tag == "loadEvent";
    }
}
