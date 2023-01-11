import {Range} from 'vscode-languageserver-textdocument';
import {FtlUri} from '../models/ftl-text-document';

export class ValueName {
  constructor(public name: string, public readonly range: Range, public readonly uri: FtlUri) {
  }
}
