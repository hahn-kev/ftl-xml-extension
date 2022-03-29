import {
  CancellationToken,
  Position,
  ProviderResult,
  Range,
  RenameProvider,
  TextDocument,
  Uri,
  WorkspaceEdit
} from 'vscode';
import {DocumentCache} from '../document-cache';
import {filterValueNameToPosition, transformModFindNode} from '../helpers';
import {VscodeConverter} from '../vscode-converter';
import {Mappers} from '../ref-mappers/mappers';
import {LookupContext} from '../ref-mappers/lookup-provider';
import {RefMapperBase} from '../ref-mappers/ref-mapper';
import {ValueName} from '../ref-mappers/value-name';

export class FtlRenameProvider implements RenameProvider {
  constructor(private documentCache: DocumentCache, private mappers: Mappers) {
  }

  getContext(document: TextDocument, position: Position): LookupContext {
    const htmlDocument = this.documentCache.getHtmlDocument(document);
    const offset = document.offsetAt(position);
    let node = htmlDocument.findNodeBefore(offset);
    const findNode = transformModFindNode(node);
    if (findNode) node = findNode;
    return {node, document, position};
  }

  public prepareRename(
      document: TextDocument,
      position: Position,
      token: CancellationToken): ProviderResult<Range | { range: Range; placeholder: string }> {
    const context = this.getContext(document, position);
    for (const mapper of this.mappers.list) {
      const refs = mapper.parser.getNameDef(context) ?? mapper.parser.getRefName(context);
      const valueName = filterValueNameToPosition(refs, position);
      if (!valueName) continue;
      return {range: VscodeConverter.toVscodeRange(valueName.range), placeholder: valueName.name};
    }
    throw new Error('rename not supported here');
  }

  public provideRenameEdits(
      document: TextDocument,
      position: Position,
      newName: string,
      token: CancellationToken): ProviderResult<WorkspaceEdit> {
    const context = this.getContext(document, position);
    let mapper: RefMapperBase | undefined = undefined;
    let valueName: ValueName | undefined;
    for (mapper of this.mappers.list) {
      const refs = mapper.parser.getNameDef(context) ?? mapper.parser.getRefName(context);
      valueName = filterValueNameToPosition(refs, position);
      if (valueName) break;
    }
    if (!valueName || !mapper) return;
    const refs = mapper.refs.get(valueName.name);
    if (!refs) return;
    const edit = new WorkspaceEdit();
    for (const ref of refs) {
      edit.replace(Uri.parse(ref.file.uri), VscodeConverter.toVscodeRange(ref.range), newName);
    }
    return edit;
  }
}
