import {FtlValue} from './ftl-value';
import {FtlTextDocument} from './ftl-text-document';
import {Node} from 'vscode-html-languageservice';
import {FtlFile} from './ftl-file';
import {BlueprintListTypeAny} from '../data/ftl-data';
import {normalizeAttributeName} from '../helpers';

export class FtlBlueprintList extends FtlValue {
  readonly kind = 'blueprint-list';

  constructor(name: string, file: FtlFile, node: Node, document: FtlTextDocument, isDef: boolean) {
    super(name, file, node, document, isDef);
    this.isAnyType = normalizeAttributeName(node.attributes?.type) == BlueprintListTypeAny;
  }

  public childRefNames: string[] = [];
  public children: FtlBlueprintValue[] = [];
  public readonly isAnyType: boolean;
}

export class FtlBlueprintValue extends FtlValue {
  readonly kind = 'blueprint-list-value';
}
