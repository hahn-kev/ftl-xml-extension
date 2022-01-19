import {HTMLDataV1, IAttributeData, ITagData} from 'vscode-html-languageservice';

export interface XmlTag extends ITagData {
  tags?: string[] | undefined;
  requiredTags?: string[];
  contentsValueSet?: string;
  requiredTagsByParent?: { [key: string]: string[] };
}

export type XmlData = HTMLDataV1 & { tags: XmlTag[] };


export function boolAttr(name: string): IAttributeData {
  return {name: name, valueSet: 'bool'};
}
