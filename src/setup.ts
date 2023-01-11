import {FltDocumentValidator} from './flt-document-validator';
import {CodeActionKind, commands, DocumentSelector, languages, window, workspace} from 'vscode';
import {FtlDefinitionProvider} from './providers/ftl-definition-provider';
import {FtlReferenceProvider} from './providers/ftl-reference-provider';
import {FtlHoverProvider} from './providers/ftl-hover-provider';
import {FtlCodeActionProvider} from './providers/ftl-code-action-provider';
import {FtlColorProvider} from './providers/ftl-color-provider';
import {WorkspaceParser} from './workspace-parser';
import {FtlDatFs} from './dat-fs-provider/ftl-dat-fs';
import {AnimationPreview} from './animation-preview/animation-preview';
import {FtlServices, setupCore} from './setup-core';
import {FtlFoldingProvider} from './providers/ftl-folding-provider';
import {FtlCodeLensProvider} from './providers/ftl-code-lens-provider';
import {FtlRenameProvider} from './providers/ftl-rename-provider';
import {FtlCompletionAdapter} from './providers/ftl-completion-adapter';
import {FtlFormattingProvider} from './providers/ftl-formatting-provider';
import {FileUsedValidator} from './validators/file-used-validator';


export type disposable = { dispose(): unknown };

type Created = { workspaceParser: WorkspaceParser, subs: disposable[], services: FtlServices };

export function setupVscodeProviders(services: FtlServices): Created {
  const ftlLanguage = 'ftl-xml';
  const ftlXmlDoc: DocumentSelector = [
    {language: ftlLanguage, scheme: 'file'},
    {
      language: ftlLanguage,
      scheme: FtlDatFs.scheme
    }
  ];


  const diagnosticCollection = languages.createDiagnosticCollection('ftl-xml');
  const ftlDocumentValidator = new FltDocumentValidator(
      diagnosticCollection,
      services.validators,
      [
          // disabled because it gave too many false positives for things that are used but aren't checked yet
          // new FileUsedValidator(services.pathMappers)
      ],
      services.output,
  );
  const workspaceParser = new WorkspaceParser(services.parser, ftlDocumentValidator, services.datCache, services.output);

  // providers
  const ftlDefinitionProvider = new FtlDefinitionProvider(services.documentCache, services.lookupProviders);
  const ftlReferenceProvider = new FtlReferenceProvider(services.documentCache, services.lookupProviders);
  const hoverProvider = new FtlHoverProvider(services.documentCache,
      services.htmlService,
      services.mappers,
      services.pathMappers);
  const completionItemProvider = new FtlCompletionAdapter(services.documentCache,
      services.htmlService,
      services.mappers.blueprintMapper);
  const fsWatcher = workspace.createFileSystemWatcher(WorkspaceParser.findPattern, false, true, false);

  const ftlDatFS = new FtlDatFs(services.datCache);

  // kinda ugly, but the ftlParser depends on a list of parsers, and the color provider depends on the parser
  // I should split them out, but I like the parsing and color providing in the same place
  const ftlColor = new FtlColorProvider(services.parser);
  services.parsers.push(ftlColor);

  return {
    workspaceParser,
    services,
    subs: [
      fsWatcher.onDidCreate((e) => services.parser.fileAdded(e)),
      fsWatcher.onDidDelete((e) => services.parser.fileRemoved(e)),
      window.onDidChangeActiveTextEditor((e) => {
        if (e?.document.languageId === ftlLanguage) {
          const file = ftlDocumentValidator.validateDocument(e.document, services.parser.root);
          AnimationPreview.updateMenuContext(file);
        }
      }),
      workspace.onDidChangeTextDocument((e) => {
        if (e.document?.languageId == ftlLanguage && e.contentChanges.length > 0) {
          // todo look into partial document parsing, it's slow for animation files which are long
          const file = services.parser.parseDocument(e.document);
          ftlDocumentValidator.validateFile(file);
          setTimeout(()=> {
            if (workspace.textDocuments?.length > 0) {
              ftlDocumentValidator.validateDocuments(workspace.textDocuments, services.parser.root);
            }
          });
        }
      }),
      workspace.onDidSaveTextDocument(e => {
        ftlDocumentValidator.validateFtlRoot(services.parser.root);
      }),
      workspace.onDidChangeWorkspaceFolders(async (e) => {
        if (e.removed.length > 0) {
          // refresh all, todo just remove files that were in the workspace and call update data
          services.output.appendLine('workspace folders removed, reparse whole workspace');
          await workspaceParser.parseWorkspace();
        } else if (e.added.length > 0) {
          await workspaceParser.workspaceFoldersAdded(e.added);
        }
      }),
      workspace.registerFileSystemProvider(FtlDatFs.scheme, ftlDatFS, {isCaseSensitive: true, isReadonly: true}),
      languages.registerCompletionItemProvider(ftlXmlDoc, completionItemProvider, '<', '"'),
      languages.registerHoverProvider(ftlXmlDoc, hoverProvider),
      languages.registerDefinitionProvider(ftlXmlDoc, ftlDefinitionProvider),
      languages.registerReferenceProvider(ftlXmlDoc, ftlReferenceProvider),
      languages.registerFoldingRangeProvider(ftlXmlDoc, new FtlFoldingProvider(services.htmlService, services.output)),
      languages.registerRenameProvider(ftlXmlDoc, new FtlRenameProvider(services.documentCache, services.mappers)),
      languages.registerCodeLensProvider(ftlXmlDoc, new FtlCodeLensProvider(services.parser, services.mappers)),
      // languages.registerDocumentFormattingEditProvider(ftlXmlDoc, formattingProvider),
      // languages.registerDocumentRangeFormattingEditProvider(ftlXmlDoc, formattingProvider),
      languages.registerCodeActionsProvider(ftlXmlDoc,
          new FtlCodeActionProvider(services.documentCache, services.requiredChildrenParser),
          {
            providedCodeActionKinds: [
              CodeActionKind.QuickFix
            ]
          }),
      languages.registerColorProvider(ftlXmlDoc, ftlColor),
      commands.registerCommand(AnimationPreview.OpenPreviewCommand, async (...args) => {
        await new AnimationPreview(services.mappers, services.parser, services.documentCache).openFromCommand(args);
      })
    ]
  };
}

export function setup(registerProviders = false): Created {

  const output = window.createOutputChannel('FTL');
  return setupVscodeProviders(
    setupCore((uri) => workspace.openTextDocument(uri), (uri) => workspace.fs.readFile(uri), output)
  );
}
