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
import {
  getEol,
  getText,
  hasAttr,
  nodeTagEq,
  normalizeAttributeName,
  toRange,
  transformModFindNode
} from '../helpers';
import {RequiredChildrenParser} from '../parsers/required-children-parser';
import {VscodeConverter} from '../vscode-converter';

class ResolvableCodeAction extends CodeAction {
  constructor(
      title: string,
      kind: CodeActionKind,
      private callback: (action: CodeAction) => void
  ) {
    super(title, kind);
  }

  resolve() {
    this.callback(this);
  }
}

export class FtlCodeActionProvider implements CodeActionProvider<ResolvableCodeAction | CodeAction> {
  constructor(private documentCache: DocumentCache, private requiredChildrenParser: RequiredChildrenParser) {

  }

  private actionMethods = [
    this.changeListTypeCodeAction.bind(this),
    this.markAsUnused.bind(this),
    this.extractEvent.bind(this),
  ];

  provideCodeActions(
      document: TextDocument,
      range: Range | Selection,
      context: CodeActionContext,
      token: CancellationToken): ProviderResult<(Command | CodeAction | ResolvableCodeAction)[]> {
    const actions: CodeAction[] = [];
    const node = this.getNode(document, range);
    if (!node) return;
    for (const actionMethod of this.actionMethods) {
      const action = actionMethod(document, node, range, context);
      if (action) actions.push(action);
    }

    return actions;
  }

  resolveCodeAction(
      codeAction: ResolvableCodeAction | CodeAction,
      token: CancellationToken): ProviderResult<CodeAction> {
    if (codeAction instanceof ResolvableCodeAction) codeAction.resolve();
    return undefined;
  }

  private markAsUnused(
      document: TextDocument,
      node: Node,
      range: Range | Selection,
      context: CodeActionContext): CodeAction | undefined {
    const unusedDefDiagnostic = context.diagnostics.find(diag => diag.code == FtlErrorCode.unusedRef);
    if (!unusedDefDiagnostic || !unusedDefDiagnostic.range.intersection(range)) return;
    if (!node) return;
    const action = new CodeAction(`Disable unused reference warning`, CodeActionKind.QuickFix);
    action.diagnostics = [unusedDefDiagnostic];
    action.edit = new WorkspaceEdit();
    action.edit.insert(document.uri,
        document.positionAt((node.startTagEnd ?? node.end) - 1),
        ` unused="true"`);
    return action;
  }

  private changeListTypeCodeAction(
      document: TextDocument,
      baseNode: Node,
      range: Range | Selection,
      context: CodeActionContext): CodeAction | undefined {
    const invalidTypeDiagnostic = context.diagnostics.find((diag) => diag.code == FtlErrorCode.listTypeMismatch);
    if (!invalidTypeDiagnostic) return;

    let node: Node | undefined = baseNode;
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
      const indenting = getEol(document.eol);
      action.edit.insert(document.uri, document.positionAt(node.startTagEnd!),
          `${indenting}<${missingTag}></${missingTag}>`);
      return action;
    });
  }

  getNode(document: TextDocument, range: Range | Selection): Node | undefined {
    const htmlDocument = this.documentCache.getHtmlDocument(document);
    return htmlDocument.findNodeBefore(document.offsetAt(range.start));
  }

  private extractEvent(
      document: TextDocument,
      node: Node,
      range: Range | Selection,
      context: CodeActionContext) {
    if (!nodeTagEq(node, 'event') || !nodeTagEq(node.parent, 'choice') || hasAttr(node,
        'load') || typeof node.startTagEnd === 'undefined') return;

    return new ResolvableCodeAction('Convert to Named Event', CodeActionKind.QuickFix, (action) => {
      if (!node.parent || typeof node.startTagEnd === 'undefined') return;
      const baseEventNode = this.findBaseEventNode(node.parent);
      if (!baseEventNode) return;
      const baseEventName = normalizeAttributeName(baseEventNode.attributes.name);
      const baseEventStartPosition = document.positionAt(baseEventNode.start);

      action.edit = new WorkspaceEdit();
      // replace with load
      const eventName = baseEventName + '_CHILD';
      action.edit.replace(document.uri,
          VscodeConverter.toVscodeRange(toRange(node.start, node.end, document)),
          `<event load="${eventName}"/>`);

      // write new event with name
      const eventIndentLength = document.positionAt(node.start).character;
      let eventText = getText(node.start - eventIndentLength, node.end, document);
      const openTagLength = node.startTagEnd - node.start;
      const insertNameLocation = openTagLength - 1 + eventIndentLength;
      eventText = [
        eventText.slice(0, insertNameLocation),
        ` name="${eventName}"`,
        eventText.slice(insertNameLocation)
      ].join('');
      eventText = getEol(document.eol) + this.fixIndenting(eventText, ' '.repeat(baseEventStartPosition.character), getEol(document.eol));
      action.edit.insert(document.uri, document.positionAt(baseEventNode.end), eventText);
    });
  }

  private fixIndenting(text: string, indentStr: string, eol: string): string {
    let amountToRemove: number | undefined;
    const lines = text.split(eol);
    return lines.map(line => {
      if (amountToRemove === undefined) {
        const lineTrim = line.trimStart();
        amountToRemove = line.length - lineTrim.length - indentStr.length;
        return indentStr + lineTrim;
      } else {
        const lineTrim = line.trimStart();
        const amountRemoved = line.length - lineTrim.length;
        if (amountRemoved < amountToRemove) return line;
        return line.slice(amountToRemove);
      }
    }).join(eol);
  }

  private findBaseEventNode(node: Node): (Node & { attributes: { name: string } }) | undefined {
    if (nodeTagEq(node, 'event') && hasAttr(node, 'name')) return node;
    if (!node.parent) return undefined;
    return this.findBaseEventNode(node.parent);
  }
}
