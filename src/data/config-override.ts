import {XmlTag} from './xml-data/helpers';
import {Selector} from '../selectors/selector';
import {Node} from 'vscode-html-languageservice';

export class ConfigOverride {
  static getActualConfig(baseTag: XmlTag, node: Node): XmlTag
  static getActualConfig(baseTag: XmlTag | undefined, node: Node): XmlTag | undefined
  static getActualConfig(baseTag: XmlTag | undefined, node: Node): XmlTag | undefined {
    if (!baseTag) return undefined;
    if (!baseTag.configOverride) return baseTag;
    const overrides = Object.entries(baseTag.configOverride);
    for (const [pattern, override] of overrides) {
      if (Selector.match(node, pattern)) {
        return {...baseTag, ...override};
      }
    }
    return baseTag;
  }
}
