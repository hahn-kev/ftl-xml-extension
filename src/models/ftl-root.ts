import {FtlFile} from './ftl-file';
import {SoundFile} from './sound-file';

export class FtlRoot {
  constructor() {
    this.files = new Map<string, FtlFile>();
  }

  files: Map<string, FtlFile>;
  soundWaveFiles: SoundFile[] = [];
  musicFiles: SoundFile[] = [];
}
