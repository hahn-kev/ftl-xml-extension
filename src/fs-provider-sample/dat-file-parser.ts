import {Uri} from 'vscode';
import {File} from './file';
import {Directory} from './directory';

export class DatFileParser {
  parse(workspaceFolder: Uri): Map<string, File | Directory> {
    const map = new Map<string, File | Directory>();
    const file = new File('test');
    file.data = Buffer.from('hello');
    map.set('test', file);
    return map;
  }
}
