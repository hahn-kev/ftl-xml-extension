import {Position} from 'vscode-languageserver-textdocument';
import {FtlFile} from './ftl-file';


export interface FtlEvent {
    file: FtlFile
    name: string;
    offset: number;
    position: Position
}
