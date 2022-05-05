import {HTMLDataV1, IAttributeData, ITagData} from 'vscode-html-languageservice';
import {Pattern} from '../../selectors/selector';

export interface XmlTag extends ITagData {
  tags?: string[] | undefined;
  requiredTags?: string[];
  contentsValueSet?: string;
  requiredTagsByParent?: { [key: string]: string[] };
  configOverride?: Record<Pattern, Partial<Omit<XmlTag, 'configOverride'>>>;
}

export type XmlData = Omit<HTMLDataV1, 'tags'> & { tags: XmlTag[], tagMap: Map<string, XmlTag> };


export function boolAttr(name: string, description?: string): IAttributeData {
  return {name: name, valueSet: 'bool', description};
}
