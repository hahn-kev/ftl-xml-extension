import {IValueSet} from 'vscode-html-languageservice';
import {NodeMapContext} from './node-map-context';
import {getAttrValueForTag, getNodeContent} from '../../helpers';
import {FtlData} from '../../data/ftl-data';
import {ValueName} from '../value-name';

export function declarationBasedMapFunction(valueSet: IValueSet): (context: NodeMapContext) => ValueName | undefined {
  const refDeclarations = findValueSetReferences(valueSet);
  return (context) => {
    for (const refDeclaration of refDeclarations) {
      let result: ValueName | undefined;
      switch (refDeclaration.type) {
        case 'contents':
          result = getNodeContent(context.node, context.document, refDeclaration.tag);
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

type referenceDeclaration = { type: 'attr', tag: string, attr: string } | { type: 'contents', tag: string };

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
