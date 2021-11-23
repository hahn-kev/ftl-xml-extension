import {FtlParser} from './ftl-parser';
import {FltDocumentValidator} from './flt-document-validator';
import {
    CodeActionKind,
    CodeActionProviderMetadata,
    commands,
    DocumentSelector,
    languages,
    RelativePattern,
    window,
    workspace
} from 'vscode';
import {getLanguageService} from 'vscode-html-languageservice';
import {DocumentCache} from './document-cache';
import {mappers} from './ref-mappers/mappers';
import {FtlDataProvider} from './providers/ftl-data-provider';
import {FtlDefinitionProvider} from './providers/ftl-definition-provider';
import {FtlReferenceProvider} from './providers/ftl-reference-provider';
import {FtlHoverProvider} from './providers/ftl-hover-provider';
import {FtlCompletionProvider} from './providers/ftl-completion-provider';
import {FtlCodeActionProvider} from './providers/ftl-code-action-provider';
import {FtlColorProvider} from './providers/ftl-color-provider';
import {FtlXmlParser} from './parsers/ftl-xml-parser';
import {IncompleteTagParser} from './parsers/incomplete-tag-parser';
import {EventUsedValidator} from './validators/event-used-validator';
import eventsMapper = mappers.eventsMapper;

export type disposable = { dispose(): any };

export function setup(): { ftlParser: FtlParser; ftlDocumentValidator: FltDocumentValidator; subs: disposable[] } {
    const ftlXmlDoc: DocumentSelector & { language: string } = {language: 'ftl-xml', scheme: 'file'};
    let diagnosticCollection = languages.createDiagnosticCollection('ftl-xml');
    let service = getLanguageService({useDefaultDataProvider: false});
    let documentCache = new DocumentCache(service);
    let {mappers: mappersList, blueprintMapper} = mappers.setup(documentCache);
    let parsers: FtlXmlParser[] = [
        ...mappersList.map(value => value.parser),
        new IncompleteTagParser(),
    ];
    let ftlParser = new FtlParser(documentCache, parsers);
    let ftlColor = new FtlColorProvider(ftlParser);
    //kinda ugly, but the ftlParser depends on a list of parsers, and the color provider depends on the parser
    //I should split them out, but I like the parsing and color providing in the same place
    parsers.push(ftlColor);
    let ftlDataProvider = new FtlDataProvider(ftlParser.onFileParsed, mappersList);
    let ftlCodeAction = new FtlCodeActionProvider(documentCache);
    service.setDataProviders(false, [ftlDataProvider]);

    let ftlDefinitionProvider = new FtlDefinitionProvider(documentCache, mappersList);
    let ftlDocumentValidator = new FltDocumentValidator(documentCache,
        diagnosticCollection,
        blueprintMapper,
        mappersList,
        ftlParser,
        [new EventUsedValidator(eventsMapper)]);
    let ftlReferenceProvider = new FtlReferenceProvider(documentCache, mappersList);
    let hoverProvider = new FtlHoverProvider(documentCache, service);
    let completionItemProvider = new FtlCompletionProvider(documentCache, service, blueprintMapper, mappersList);

    window.onDidChangeActiveTextEditor(e => {
        if (e?.document.languageId === ftlXmlDoc.language) {
            ftlDocumentValidator.validateDocument(e.document);
        }
    });
    workspace.onDidChangeTextDocument(e => {
        if (e.document?.languageId == ftlXmlDoc.language) {
            ftlParser.parseFile(e.document);
            ftlDocumentValidator.validateDocument(e.document);
        }
    });
    workspace.onDidChangeWorkspaceFolders(async e => {
        if (e.removed.length > 0) {
            //refresh all, todo just remove files that were in the workspace and call update data
            await parseWorkspace(ftlParser, ftlDocumentValidator);
        } else if (e.added.length > 0) {
            //parse new files
            for (let workspaceFolder of e.added) {
                let pattern = new RelativePattern(workspaceFolder, '**/*.{xml,xml.append}');
                let files = await workspace.findFiles(pattern);
                await ftlParser.parseFiles(files);
                for (let fileUri of files) {
                    ftlDocumentValidator.validateDocument(await workspace.openTextDocument(fileUri));
                }
            }
        }
    });
    commands.registerCommand('ftl-xml.parse-workspace', async () => {
        if (!ftlParser.isParsing)
            await parseWorkspace(ftlParser, ftlDocumentValidator);
    });

    let metadata: CodeActionProviderMetadata = {
        providedCodeActionKinds: [
            CodeActionKind.QuickFix
        ]
    };
    return {
        ftlParser,
        ftlDocumentValidator,
        subs: [
            diagnosticCollection,
            languages.registerCompletionItemProvider(ftlXmlDoc, completionItemProvider, '<', '"'),
            languages.registerHoverProvider(ftlXmlDoc, hoverProvider),
            languages.registerDefinitionProvider(ftlXmlDoc, ftlDefinitionProvider),
            languages.registerReferenceProvider(ftlXmlDoc, ftlReferenceProvider),
            languages.registerCodeActionsProvider(ftlXmlDoc, ftlCodeAction, metadata),
            languages.registerColorProvider(ftlXmlDoc, ftlColor)
        ]
    };
}

export async function parseWorkspace(ftlParser: FtlParser, ftlDocumentValidator: FltDocumentValidator) {
    let files = await ftlParser.parseCurrentWorkspace();
    for (let ftlFile of files.values()) {
        ftlDocumentValidator.validateDocument(await workspace.openTextDocument(ftlFile.uri));
    }
}
