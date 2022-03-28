import {Node} from 'vscode-html-languageservice';
import {FtlTextDocument} from '../../models/ftl-text-document';
import {Position} from 'vscode-languageserver-textdocument';
import {NodeMapContext} from './node-map-context';

export interface NodeMap {
  getNameDef(node: Node, document: FtlTextDocument, position?: Position): string | undefined;

  getRefName(node: Node, document: FtlTextDocument, position: Position): string | undefined;

  getRefName(node: Node, document: FtlTextDocument): string | string[] | undefined;

  getRefName(node: Node, document: FtlTextDocument): string | string[] | undefined;
}

type getRefName = ((context: { node: Node, document: FtlTextDocument }) => string | string[] | undefined)
    & ((context: { node: Node, document: FtlTextDocument, position: Position }) => string | undefined)

export class NodeMapImp implements NodeMap {
  constructor(private nameDef: (context: NodeMapContext) => string | undefined,
              private refName: getRefName) {
  }

  public getNameDef(node: Node, document: FtlTextDocument, position?: Position): string | undefined {
    return this.nameDef({node, document, position});
  }

  public getRefName(node: Node, document: FtlTextDocument, position: Position): string | undefined;
  public getRefName(node: Node, document: FtlTextDocument): string | string[] | undefined;
  public getRefName(node: Node, document: FtlTextDocument, position?: Position): string | undefined | string[] {
    if (position) return this.refName({node, document, position});
    return this.refName({node, document});
  }
}
