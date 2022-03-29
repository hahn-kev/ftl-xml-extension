import {Range} from 'vscode-languageserver-textdocument';

export class ValueName {
  constructor(public name: string, public readonly range: Range) {
  }
}
