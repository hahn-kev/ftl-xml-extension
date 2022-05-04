import {
  CancellationToken,
  CodeAction,
  CodeActionContext,
  CodeActionKind,
  CodeActionProvider,
  Command,
  EndOfLine,
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
import {RequiredChildrenParser} from '../parsers/required-children-parser';

export class FtlCodeActionProvider implements CodeActionProvider {
  constructor(private documentCache: DocumentCache, private requiredChildrenParser: RequiredChildrenParser) {

  }

  provideCodeActions(
      document: TextDocument,
      range: Range | Selection,
      context: CodeActionContext,
      token: CancellationToken): ProviderResult<(Command | CodeAction)[]> {
    const actions: CodeAction[] = [];
    let action = this.changeListTypeCodeAction(document, range, context);
    if (action) actions.push(action);
    action = this.markAsUnused(document, range, context);
    if (action) actions.push(action);
    // const result = this.fixMissingChild(document, range, context);
    // if (result) actions.push(...result);
    return actions;
  }

  markAsUnused(
      document: TextDocument,
      range: Range | Selection,
      context: CodeActionContext): CodeAction | undefined {
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
    return action;
  }

  changeListTypeCodeAction(
      document: TextDocument,
      range: Range | Selection,
      context: CodeActionContext): CodeAction | undefined {
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
    return action;
  }

  // todo determine how to handle indenting properly, and fix issue with diagnostic not showing up
  fixMissingChild(
      document: TextDocument,
      range: Range | Selection,
      context: CodeActionContext): CodeAction[] | undefined {
    const missingChildDiagnostics = context.diagnostics.filter(diag => diag.code == FtlErrorCode.missingRequiredChild);
    if (missingChildDiagnostics.length == 0) return;
    const node = this.getNode(document, range);
    // not supporting tags that are self closing for now
    if (!node || node.startTagEnd === undefined) return;
    const missingChildren = this.requiredChildrenParser.missingChildren(node);
    if (!missingChildren || missingChildren.length == 0) return;
    return missingChildren.map(missingTag => {
      const action = new CodeAction(`Add missing tag '${missingTag}'`, CodeActionKind.QuickFix);
      const diag = missingChildDiagnostics.find(d => d.message.includes(`'${missingTag}'`));
      if (diag) action.diagnostics = [diag];
      action.edit = new WorkspaceEdit();
      const indenting = document.eol == EndOfLine.LF ? '\n' : '\r\n';
      action.edit.insert(document.uri, document.positionAt(node.startTagEnd!),
          `${indenting}<${missingTag}></${missingTag}>`);
      return action;
    });
  }

  getNode(document: TextDocument, range: Range | Selection): Node | undefined {
    const htmlDocument = this.documentCache.getHtmlDocument(document);
    return htmlDocument.findNodeBefore(document.offsetAt(range.start));
  }

  resolveCodeAction(codeAction: CodeAction, token: CancellationToken): ProviderResult<CodeAction> {
    return undefined;
  }
}
