import {FtlEvent} from './ftl-event';

export interface FtlFile {
    uri: string,
    events: FtlEvent[]
}
