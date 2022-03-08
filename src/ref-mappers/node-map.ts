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

type staticValueMapping = { tag: string, attr: string } | {tag: string, parentTag?: string, type: 'contents'};

export function staticValueNodeMap(defs: staticValueMapping[], refs: staticValueMapping[]): NodeMap {
  function getResult(context: NodeMapContext, def: staticValueMapping): string|undefined {
    if ('type' in def && def.type === 'contents') {
      return getNodeTextContent(context.node, context.document, def.tag, def.parentTag);
    } else if ('attr' in def) {
      return getAttrValueForTag(context.node, def.tag, def.attr, context.document, context.position);
    }
  }
  return new NodeMapImp(
      (context) => {
        for (const def of defs) {
          const result = getResult(context, def);
          if (result) return result;
        }
      },
      (context) => {
        const results: string[] = [];
        for (const ref of refs) {
          const result = getResult(context, ref);
          if (!result) continue;
          if (context.position) {
            return result;
          } else {
            results.push(result);
          }
        }
        return results;
      });
}

type referenceDeclaration = { type: 'attr', tag: string, attr: string } | { type: 'contents', tag: string };

export function declarationBasedMapFunction(valueSet: IValueSet): (context: NodeMapContext) => string | undefined {
  const refDeclarations = findValueSetReferences(valueSet);
  return (context) => {
    for (const refDeclaration of refDeclarations) {
      let result: string | undefined;
      switch (refDeclaration.type) {
        case 'contents':
          result = getNodeTextContent(context.node, context.document, refDeclaration.tag);
          break;
        case 'attr':
          result = getAttrValueForTag(context.node,
              refDeclaration.tag,
              refDeclaration.attr,
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
    tag: tag.name
  } : undefined);
  const attrRefs = FtlData.tags.flatMap((tag) => tag.attributes.map((attr) => attr.valueSet == valueSet.name ? {
    type: 'attr',
    tag: tag.name,
    attr: attr.name
  } : undefined));
  return [
    ...contentsRefs,
    ...attrRefs
  ].filter((rd): rd is referenceDeclaration => !!rd);
}
