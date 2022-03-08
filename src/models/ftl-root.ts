import {FtlFile} from './ftl-file';
import {SoundFile} from './sound-file';
import {FtlImg} from './ftl-img';
import {HyperspaceFile} from './hyperspace-file';

export class FtlRoot {
  constructor() {
    this.xmlFiles = new Map<string, FtlFile>();
  }

  xmlFiles: Map<string, FtlFile>;
  hyperspaceFile?: HyperspaceFile;
  soundWaveFiles: SoundFile[] = [];
  musicFiles: SoundFile[] = [];
  imgFiles: FtlImg[] = [];

  findMatchingImg(modFileRef: string): FtlImg | undefined {
    for (const ftlImg of this.imgFiles) {
      if (ftlImg.matches(modFileRef)) {
        return ftlImg;
      }
    }
    return;
  }


  clear() {
    this.xmlFiles.clear();
    this.soundWaveFiles.length = 0;
    this.musicFiles.length = 0;
    this.imgFiles.length = 0;
  }
}
