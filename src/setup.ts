import {FtlParser} from './ftl-parser';
import {FltDocumentValidator} from './flt-document-validator';
import {
  CodeActionKind,
  CodeActionProviderMetadata,
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
import {RequiredChildrenParser} from './parsers/required-children-parser';
import {BlueprintValidator} from './blueprints/blueprint-validator';
import {AllowedChildrenParser} from './parsers/allowed-children-parser';

export type disposable = { dispose(): unknown };

export function setup(): { ftlParser: FtlParser; ftlDocumentValidator: FltDocumentValidator; subs: disposable[] } {
  const ftlXmlDoc: DocumentSelector & { language: string } = {language: 'ftl-xml', scheme: 'file'};
  const diagnosticCollection = languages.createDiagnosticCollection('ftl-xml');
  const service = getLanguageService({useDefaultDataProvider: false});
  const documentCache = new DocumentCache(service);
  const {mappers: mappersList, blueprintMapper} = mappers.setup(documentCache);
  const parsers: FtlXmlParser[] = [
    ...mappersList.map((value) => value.parser),
    new IncompleteTagParser(),
    new RequiredChildrenParser(),
    new AllowedChildrenParser()
  ];
  const ftlParser = new FtlParser(documentCache, parsers);
  const ftlColor = new FtlColorProvider(ftlParser);
  // kinda ugly, but the ftlParser depends on a list of parsers, and the color provider depends on the parser
  // I should split them out, but I like the parsing and color providing in the same place
  parsers.push(ftlColor);
  const ftlDataProvider = new FtlDataProvider(ftlParser.onFileParsed, mappersList);
  const ftlCodeAction = new FtlCodeActionProvider(documentCache);
  service.setDataProviders(false, [ftlDataProvider]);

  const ftlDefinitionProvider = new FtlDefinitionProvider(documentCache, mappersList);
  const ftlDocumentValidator = new FltDocumentValidator(documentCache,
      diagnosticCollection,
      mappersList,
      ftlParser,
      [new EventUsedValidator(mappers.eventsMapper, mappers.shipsMapper), new BlueprintValidator(blueprintMapper)]);
  const ftlReferenceProvider = new FtlReferenceProvider(documentCache, mappersList);
  const hoverProvider = new FtlHoverProvider(documentCache, service);
  const completionItemProvider = new FtlCompletionProvider(documentCache, service, blueprintMapper);

  window.onDidChangeActiveTextEditor((e) => {
    if (e?.document.languageId === ftlXmlDoc.language) {
      ftlDocumentValidator.validateDocument(e.document);
    }
  });
  workspace.onDidChangeTextDocument((e) => {
    if (e.document?.languageId == ftlXmlDoc.language) {
      ftlParser.parseFile(e.document);
      ftlDocumentValidator.validateDocument(e.document);
    }
  });
  workspace.onDidChangeWorkspaceFolders(async (e) => {
    if (e.removed.length > 0) {
      // refresh all, todo just remove files that were in the workspace and call update data
      await parseWorkspace(ftlParser, ftlDocumentValidator);
    } else if (e.added.length > 0) {
      // parse new files
      for (const workspaceFolder of e.added) {
        const pattern = new RelativePattern(workspaceFolder, '**/*.{xml,xml.append}');
        const files = await workspace.findFiles(pattern);
        await ftlParser.parseFiles(files);
        await ftlDocumentValidator.validateFiles(files);
      }
    }
  });

  const metadata: CodeActionProviderMetadata = {
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
  const files = await ftlParser.parseCurrentWorkspace();
  await ftlDocumentValidator.validateFtlFiles(Array.from(files.values()));
}
