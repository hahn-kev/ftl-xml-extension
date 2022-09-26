import {IValueSet} from 'vscode-html-languageservice';
import {NodeMapContext} from './node-map-context';
import {getAttrValueForTag, getNodeContent} from '../../helpers';
import {FtlData} from '../../data/ftl-data';
import {ValueName} from '../value-name';
import {XmlTag} from '../../data/xml-data/helpers';
import {Pattern, Selector} from '../../selectors/selector';

export function declarationBasedMapFunction(valueSet: IValueSet): (context: NodeMapContext) => ValueName | undefined {
  const refDeclarations = findValueSetReferences(valueSet);
  return (context) => {
    for (const refDeclaration of refDeclarations) {
      let result: ValueName | undefined;
      if (refDeclaration.configName && !Selector.match(context.node, refDeclaration.configName)) continue;
      switch (refDeclaration.type) {
        case 'contents':
          result = getNodeContent(context.node, context.document, refDeclaration.tag);
          break;
        case 'attr':
          result = getAttrValueForTag(context.node,
              refDeclaration.tag,
              refDeclaration.attr,
              context.document);
          break;
      }
      if (result) return result;
    }
    return undefined;
  };
}

export type ReferenceDeclaration = { type: 'attr', tag: string, attr: string, configName?: Pattern }
 | { type: 'contents', tag: string, configName?: Pattern };

export function findValueSetReferences(valueSet: IValueSet): ReferenceDeclaration[] {
  if (!FtlData.valueSets?.includes(valueSet)) {
    throw new Error(`value set: ${valueSet.name} not included in FTL Data`);
  }
  const refs: ReferenceDeclaration[] = [];
  function processTagDef(tag: Partial<XmlTag>, tagName: string, configName?: Pattern) {
    if (tag.contentsValueSet == valueSet.name) {
      refs.push({type: 'contents', tag: tagName, configName});
    }
    if (!tag.attributes) return;
    for (const attr of tag.attributes) {
      if (attr.valueSet == valueSet.name) {
        refs.push({type: 'attr', tag: tagName, attr: attr.name, configName});
      }
    }
  }

  for (const tag of FtlData.tags) {
    processTagDef(tag, tag.name);
    if (tag.configOverride) {
      for (const [config, tagConfig] of Object.entries(tag.configOverride)) {
        processTagDef(tagConfig, tag.name, config as Pattern);
      }
    }
  }
  return refs;
}
