import {hasAttr, nodeTagEq} from '../helpers';
import {Node} from 'vscode-html-languageservice';


// here's some examples, assume the given node is <event>

//[name] true for <event name="anything">
type attributeSelector = `[${string}]`;

//parent< true for <parent> <event/> </parent>
type parentSelector = `${string}<`;

//>child true for <event> <child/> </event>
type childSelector = `>${string}`;
type subPattern = attributeSelector | parentSelector | childSelector
export type Pattern = subPattern;

export class Selector {
  private static matchers: Array<(node: Node, pattern: Pattern) => void | boolean> = [
    this.tryAttributeSelector,
    this.tryParentSelector,
    this.tryChildSelector,
    // this.tryGroupSelector,
      // commented out because it's not tested
  ];

  public static match(node: Node, pattern: Pattern): boolean {
    // todo support more than 1 pattern
    for (const matcher of this.matchers) {
      const result = matcher(node, pattern);
      if (typeof result === 'boolean') return result;
    }
    throw new Error('invalid pattern: ' + pattern);
  }

  private static tryAttributeSelector(node: Node, pattern: Pattern): void | boolean {
    if (!pattern.startsWith('[') || !pattern.endsWith(']')) return;
    const attributeName = pattern.slice(1, -1);
    return hasAttr(node, attributeName);
  }

  private static tryParentSelector(node: Node, pattern: Pattern): void | boolean {
    if (!pattern.endsWith('<')) return;
    const parentName = pattern.slice(0, -1);
    return nodeTagEq(node.parent, parentName);
  }

  private static tryChildSelector(node: Node, pattern: Pattern): void | boolean {
    if (!pattern.startsWith('>')) return;
    const childName = pattern.slice(1);
    return node.children.find(child => nodeTagEq(child, childName)) !== undefined;
  }

  private static tryGroupSelector(node: Node, pattern: Pattern): void | boolean {
    const patterns = pattern.split('&') as Pattern[];
    let result: boolean | void;
    if (patterns.length < 2) return;
    for (const childPattern of patterns) {
      result = this.match(node, childPattern);
      if (!result) return false;
    }
    return true;
  }
}
