import {FtlParser} from './ftl-parser';
import {FltDocumentValidator} from './flt-document-validator';
import {CodeActionKind, DocumentSelector, languages, window, workspace} from 'vscode';
import {getLanguageService} from 'vscode-html-languageservice';
import {DocumentCache} from './document-cache';
import {Mappers} from './ref-mappers/mappers';
import {DataReceiver, FtlDataProvider} from './providers/ftl-data-provider';
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
import {FtlDatFs} from './dat-fs-provider/ftl-dat-fs';
import {FtlDatCache} from './dat-fs-provider/ftl-dat-cache';
import {pathMappers} from './ref-mappers/path-ref-mapper';
import {VOID_ELEMENTS} from 'vscode-html-languageservice/lib/esm/languageFacts/fact';
import {LookupProvider} from './ref-mappers/lookup-provider';
import {Validator} from './validators/validator';


export type disposable = { dispose(): unknown };

type Created = { workspaceParser: WorkspaceParser, subs: disposable[] };

export function setup(registerProviders = false): Created {
  // hack to prevent img elements from getting marked as void and thus ending too soon
  // in fact.js isVoidElement is called by the parser to see if the element is self closing
  VOID_ELEMENTS.length = 0;

  const subs: disposable[] = [];

  const ftlLanguage = 'ftl-xml';
  const ftlXmlDoc: DocumentSelector = [{language: ftlLanguage, scheme: 'file'}, {
    language: ftlLanguage,
    scheme: FtlDatFs.scheme
  }];

  const service = getLanguageService({useDefaultDataProvider: false});
  const documentCache = new DocumentCache(service);

  const mappers = new Mappers();
  const parsers: FtlXmlParser[] = [
    ...mappers.list.map((value) => value.parser),
    new IncompleteTagParser(),
    new RequiredChildrenParser(),
    new AllowedChildrenParser()
  ];
  const lookupProviders: LookupProvider[] = [...mappers.list, ...pathMappers.mappers];
  const dataReceivers: DataReceiver[] = [...mappers.list, ...pathMappers.mappers];

  const diagnosticCollection = languages.createDiagnosticCollection('ftl-xml');
  const validators: Validator[] = [
    new EventUsedValidator(mappers.eventsMapper, mappers.shipsMapper),
    new BlueprintValidator(mappers.blueprintMapper),
    new RefNameValidator(mappers.list, mappers.blueprintMapper),
    new SoundFileNameValidator(),
    new ImgFileNameValidator()
  ];
  const ftlDocumentValidator = new FltDocumentValidator(documentCache, diagnosticCollection, validators);

  const ftlParser = new FtlParser(documentCache, parsers, pathMappers.mappers);
  const ftlDatCache = new FtlDatCache();
  const workspaceParser = new WorkspaceParser(ftlParser, ftlDocumentValidator, ftlDatCache);

  // kinda ugly, but the ftlParser depends on a list of parsers, and the color provider depends on the parser
  // I should split them out, but I like the parsing and color providing in the same place
  const ftlColor = new FtlColorProvider(ftlParser);
  parsers.push(ftlColor);

  service.setDataProviders(false, [
    new FtlDataProvider(ftlParser.onParsed, dataReceivers)
  ]);

  // providers
  const ftlDefinitionProvider = new FtlDefinitionProvider(documentCache, lookupProviders);
  const ftlReferenceProvider = new FtlReferenceProvider(documentCache, lookupProviders);
  const ftlCodeActionProvider = new FtlCodeActionProvider(documentCache);
  const hoverProvider = new FtlHoverProvider(documentCache, service, mappers);
  const completionItemProvider = new FtlCompletionProvider(documentCache, service, mappers.blueprintMapper);

  subs.push(window.onDidChangeActiveTextEditor((e) => {
    if (e?.document.languageId === ftlLanguage) {
      ftlDocumentValidator.validateDocument(e.document, ftlParser.root);
    }
  }));
  subs.push(workspace.onDidChangeTextDocument((e) => {
    if (e.document?.languageId == ftlLanguage && e.contentChanges.length > 0) {
      // todo look into partial document parsing, it's slow for animation files which are long
      const file = ftlParser.parseDocument(e.document);
      ftlDocumentValidator.validateFile(file);
    }
  }));
  subs.push(workspace.onDidChangeWorkspaceFolders(async (e) => {
    if (e.removed.length > 0) {
      // refresh all, todo just remove files that were in the workspace and call update data
      await workspaceParser.parseWorkspace();
    } else if (e.added.length > 0) {
      await workspaceParser.workspaceFoldersAdded(e.added);
    }
  }));

  const ftlDatFS = new FtlDatFs(ftlDatCache);
  if (registerProviders) {
    subs.push(
        workspace.registerFileSystemProvider(FtlDatFs.scheme, ftlDatFS, {isCaseSensitive: true, isReadonly: true}),
        languages.registerCompletionItemProvider(ftlXmlDoc, completionItemProvider, '<', '"'),
        languages.registerHoverProvider(ftlXmlDoc, hoverProvider),
        languages.registerDefinitionProvider(ftlXmlDoc, ftlDefinitionProvider),
        languages.registerReferenceProvider(ftlXmlDoc, ftlReferenceProvider),
        languages.registerCodeActionsProvider(ftlXmlDoc, ftlCodeActionProvider, {
          providedCodeActionKinds: [
            CodeActionKind.QuickFix
          ]
        }),
        languages.registerColorProvider(ftlXmlDoc, ftlColor),
    );
  }
  return {
    workspaceParser,
    subs: [diagnosticCollection, ...subs]
  };
}
