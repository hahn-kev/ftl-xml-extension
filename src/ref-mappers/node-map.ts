import {Node} from 'vscode-html-languageservice';
import {Position, TextDocument} from 'vscode';
import {getAttrValueForTag} from '../helpers';

export interface NodeMap {
  getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined;

  getRefName(node: Node, document: TextDocument, position: Position): string | undefined;

  getRefName(node: Node, document: TextDocument): string | string[] | undefined;

  getRefName(node: Node, document: TextDocument): string | string[] | undefined;
}

interface NodeMapContext {
  node: Node;
  document: TextDocument;
  /**
   * it's expected that if position is defined that only one ref is returned
   */
  position?: Position;
}

export class NodeMapImp implements NodeMap {
  constructor(private nameDef: (context: NodeMapContext) => string | undefined,
              private refName: (context: NodeMapContext) => string | string[] | undefined) {
  }

  public getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined {
    return this.nameDef({node, document, position});
  }

  public getRefName(node: Node, document: TextDocument, position: Position): string | undefined;
  public getRefName(node: Node, document: TextDocument): string | string[] | undefined;
  public getRefName(node: Node, document: TextDocument, position?: Position): string | undefined | string[] {
    return undefined;
  }
}

type attrValueMapping = { tag: string, attr: string };

export function attrValueNodeMap(defs: attrValueMapping[], refs: attrValueMapping[]): NodeMap {
  return new NodeMapImp(
      (context) => {
        for (const def of defs) {
          const result = getAttrValueForTag(context.node, def.tag, def.attr, context.document, context.position);
          if (result) return result;
        }
      },
      (context) => {
        for (const ref of refs) {
          const result = getAttrValueForTag(context.node, ref.tag, ref.attr, context.document, context.position);
          if (result) return result;
        }
      });
}
