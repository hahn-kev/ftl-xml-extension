import {FtlFile} from './ftl-file';
import {SoundFile} from './sound-file';
import {FtlImg} from './ftl-img';

export class FtlRoot {
  constructor() {
    this.files = new Map<string, FtlFile>();
  }

  files: Map<string, FtlFile>;
  soundWaveFiles: SoundFile[] = [];
  musicFiles: SoundFile[] = [];
  imgFiles: FtlImg[] = [];

  findMatchingImg(modFileRef: string) {
    for (const ftlImg of this.imgFiles) {
      if (ftlImg.matches(modFileRef)) {
        return ftlImg;
      }
    }
    return;
  }
}
