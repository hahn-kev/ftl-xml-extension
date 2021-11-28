import {FtlParser} from './ftl-parser';
import {FltDocumentValidator} from './flt-document-validator';
import {CodeActionKind, CodeActionProviderMetadata, DocumentSelector, languages, window, workspace} from 'vscode';
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
import {RefNameValidator} from './validators/ref-name-validator';
import {WorkspaceParser} from './workspace-parser';
import {SoundFileNameValidator} from './validators/sound-file-name-validator';
import {ImgFileNameValidator} from './validators/img-file-name-validator';

export type disposable = { dispose(): unknown };

type Created = { workspaceParser: WorkspaceParser, subs: disposable[] };

export function setup(): Created {
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
  const ftlDataProvider = new FtlDataProvider(ftlParser.onParsed, mappersList);
  const ftlCodeAction = new FtlCodeActionProvider(documentCache);
  service.setDataProviders(false, [ftlDataProvider]);

  const ftlDefinitionProvider = new FtlDefinitionProvider(documentCache, mappersList, ftlParser);
  const ftlDocumentValidator = new FltDocumentValidator(documentCache,
      diagnosticCollection,
      ftlParser,
      [
        new EventUsedValidator(mappers.eventsMapper, mappers.shipsMapper),
        new BlueprintValidator(blueprintMapper),
        new RefNameValidator(mappersList, blueprintMapper),
        new SoundFileNameValidator(),
        new ImgFileNameValidator()
      ]
  );
  const workspaceParser = new WorkspaceParser(ftlParser, ftlDocumentValidator);
  const ftlReferenceProvider = new FtlReferenceProvider(documentCache, mappersList);
  const hoverProvider = new FtlHoverProvider(documentCache, service);
  const completionItemProvider = new FtlCompletionProvider(documentCache, service, blueprintMapper);

  const subs: disposable[] = [];
  subs.push(window.onDidChangeActiveTextEditor((e) => {
    if (e?.document.languageId === ftlXmlDoc.language) {
      ftlDocumentValidator.validateDocument(e.document);
    }
  }));
  subs.push(workspace.onDidChangeTextDocument((e) => {
    if (e.document?.languageId == ftlXmlDoc.language && e.contentChanges.length > 0) {
      // todo look into partial document parsing, it's slow for animation files which are long
      console.time('parse document');
      const file = ftlParser.parseDocument(e.document);
      console.timeEnd('parse document');
      console.time('validate file');
      ftlDocumentValidator.validateFile(file);
      console.timeEnd('validate file');
    }
  }));
  subs.push(workspace.onDidChangeWorkspaceFolders(async (e) => {
    if (e.removed.length > 0) {
      // refresh all, todo just remove files that were in the workspace and call update data
      await workspaceParser.parseWorkspace();
    } else if (e.added.length > 0) {
      await workspaceParser.parseWorkspaceFolders(e.added);
    }
  }));

  const metadata: CodeActionProviderMetadata = {
    providedCodeActionKinds: [
      CodeActionKind.QuickFix
    ]
  };
  return {
    workspaceParser,
    subs: [
      diagnosticCollection,
      languages.registerCompletionItemProvider(ftlXmlDoc, completionItemProvider, '<', '"'),
      languages.registerHoverProvider(ftlXmlDoc, hoverProvider),
      languages.registerDefinitionProvider(ftlXmlDoc, ftlDefinitionProvider),
      languages.registerReferenceProvider(ftlXmlDoc, ftlReferenceProvider),
      languages.registerCodeActionsProvider(ftlXmlDoc, ftlCodeAction, metadata),
      languages.registerColorProvider(ftlXmlDoc, ftlColor),
      ...subs
    ]
  };
}

export async function parseWorkspace(ftlParser: FtlParser, ftlDocumentValidator: FltDocumentValidator) {
  const files = await ftlParser.parseCurrentWorkspace();
  ftlDocumentValidator.validateFtlFiles(Array.from(files.values()));
}
