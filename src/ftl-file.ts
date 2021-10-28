import {FtlEvent} from './ftl-event';
import {Uri} from 'vscode';

export interface FtlFile {
    uri: Uri,
    events: FtlEvent[]
}
