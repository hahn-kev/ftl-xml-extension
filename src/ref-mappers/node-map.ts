import {IValueSet, Node} from 'vscode-html-languageservice';
import {Position, TextDocument} from 'vscode';
import {getAttrValueForTag, getNodeTextContent} from '../helpers';
import {FtlData} from '../data/ftl-data';

export interface NodeMap {
  getNameDef(node: Node, document: TextDocument, position?: Position): string | undefined;

  getRefName(node: Node, document: TextDocument, position: Position): string | undefined;

  getRefName(node: Node, document: TextDocument): string | string[] | undefined;

  getRefName(node: Node, document: TextDocument): string | string[] | undefined;
}

export interface NodeMapContext {
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
    return this.refName({node, document, position});
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

type referenceDeclaration = { type: 'attr', tagName: string, attrName: string } | { type: 'contents', tagName: string };

export function declarationBasedMapFunction(valueSet: IValueSet): (context: NodeMapContext) => string | undefined {
  const refDeclarations = findValueSetReferences(valueSet);
  return (context) => {
    for (const refDeclaration of refDeclarations) {
      let result: string | undefined;
      switch (refDeclaration.type) {
        case 'contents':
          result = getNodeTextContent(context.node, context.document, refDeclaration.tagName);
          break;
        case 'attr':
          result = getAttrValueForTag(context.node,
              refDeclaration.tagName,
              refDeclaration.attrName,
              context.document,
              context.position);
          break;
      }
      if (result) return result;
    }
    return undefined;
  };
}

function findValueSetReferences(valueSet: IValueSet): referenceDeclaration[] {
  if (!FtlData.valueSets?.includes(valueSet)) {
    throw new Error(`value set: ${valueSet.name} not included in FTL Data`);
  }
  const contentsRefs = FtlData.tags.map((tag) => tag.contentsValueSet == valueSet.name ? {
    type: 'contents',
    tagName: tag.name
  } : undefined);
  const attrRefs = FtlData.tags.flatMap((tag) => tag.attributes.map((attr) => attr.valueSet == valueSet.name ? {
    type: 'attr',
    tagName: tag.name,
    attrName: attr.name
  } : undefined));
  return [
    ...contentsRefs,
    ...attrRefs
  ].filter((rd): rd is referenceDeclaration => !!rd);
}
