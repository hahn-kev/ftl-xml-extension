import {FtlValue} from './ftl-value';
import {FtlFile} from './ftl-file';
import {Node} from 'vscode-html-languageservice';
import {FtlTextDocument} from './ftl-text-document';
import {firstWhere, getNodeContent, tryParseInt} from '../helpers';
import {ValueName} from '../ref-mappers/value-name';

export class FtlWeapon extends FtlValue {
  readonly kind = 'Weapon';
  constructor(valueName: ValueName, file: FtlFile, node: Node, document: FtlTextDocument, isDef: boolean) {
    super(valueName, file, node, document, isDef);
    if (isDef) {
      const title = firstWhere(node.children, (child) => getNodeContent(child, document, 'title'));
      if (title) this.autocompleteDescription = `Title: ${title.name}`;
      this.weaponArt = firstWhere(node.children, c => getNodeContent(c, document, 'weaponArt'))?.name;
      this.cooldown = tryParseInt(firstWhere(node.children, c => getNodeContent(c, document, 'cooldown'))?.name);
      this.shots = tryParseInt(firstWhere(node.children, c => getNodeContent(c, document, 'shots'))?.name);
    }
  }

  weaponArt?: string;
  cooldown?: number;
  shots?: number;
}
