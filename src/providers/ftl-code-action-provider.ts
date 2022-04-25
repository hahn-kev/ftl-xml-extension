import {
  CancellationToken,
  CodeAction,
  CodeActionContext,
  CodeActionKind,
  CodeActionProvider,
  Command,
  ProviderResult,
  Range,
  Selection,
  TextDocument,
  WorkspaceEdit
} from 'vscode';
import {DocumentCache} from '../document-cache';
import {FtlErrorCode} from '../diagnostic-builder';
import {Node} from 'vscode-html-languageservice';
import {BlueprintListTypeAny} from '../data/ftl-data';
import {nodeTagEq, transformModFindNode} from '../helpers';

export class FtlCodeActionProvider implements CodeActionProvider {
  constructor(private documentCache: DocumentCache) {

  }

  provideCodeActions(
      document: TextDocument,
      range: Range | Selection,
      context: CodeActionContext,
      token: CancellationToken): ProviderResult<(Command | CodeAction)[]> {
    let result = this.changeListTypeCodeAction(document, range, context);
    if (result) return result;
    result = this.markAsUnused(document, range, context);
    return result;
  }

  markAsUnused(
      document: TextDocument,
      range: Range | Selection,
      context: CodeActionContext): CodeAction[] | undefined {
    const unusedDefDiagnostic = context.diagnostics.find(diag => diag.code == FtlErrorCode.unusedRef);
    if (!unusedDefDiagnostic) return;
    const node = this.getNode(document, range);
    if (!node) return;
    const action = new CodeAction(`Disable unused reference warning`, CodeActionKind.QuickFix);
    action.diagnostics = [unusedDefDiagnostic];
    action.edit = new WorkspaceEdit();
    action.edit.insert(document.uri,
        document.positionAt((node.startTagEnd ?? node.end) - 1),
        ` unused="true"`);
    return [action];
  }

  changeListTypeCodeAction(
      document: TextDocument,
      range: Range | Selection,
      context: CodeActionContext): CodeAction[] | undefined {
    const invalidTypeDiagnostic = context.diagnostics.find((diag) => diag.code == FtlErrorCode.listTypeMismatch);
    if (!invalidTypeDiagnostic) return;
    let node = this.getNode(document, range);
    if (!node) return;
    const findNode = transformModFindNode(node);
    if (findNode) node = findNode;

    if (nodeTagEq(node, 'name')) {
      node = node.parent;
    }
    if (!nodeTagEq(node, 'blueprintList')) return;
    const action = new CodeAction(`Change type of blueprint list to 'any'`, CodeActionKind.QuickFix);
    action.diagnostics = [invalidTypeDiagnostic];
    action.edit = new WorkspaceEdit();
    action.edit.insert(document.uri,
        document.positionAt((node.startTagEnd ?? node.end) - 1),
        ` type="${BlueprintListTypeAny}"`);
    return [action];
  }

  getNode(document: TextDocument, range: Range | Selection): Node | undefined {
    const htmlDocument = this.documentCache.getHtmlDocument(document);
    return htmlDocument.findNodeBefore(document.offsetAt(range.start));
  }

  resolveCodeAction(codeAction: CodeAction, token: CancellationToken): ProviderResult<CodeAction> {
    return undefined;
  }
}
