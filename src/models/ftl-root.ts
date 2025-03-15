import {FtlFile} from './ftl-file';
import {SoundFile} from './sound-file';
import {FtlImg} from './ftl-img';
import {HyperspaceFile} from './hyperspace-file';
import {FtlShipIcon} from './ftl-ship-icon';
import {FtlShipRoomImage} from './ftl-ship-room-image';

export class FtlRoot {
  constructor() {
    this.xmlFiles = new Map<string, FtlFile>();
  }

  xmlFiles: Map<string, FtlFile>;
  get hyperspaceFiles(): HyperspaceFile[] {
    return Array.from(this.xmlFiles.values()).filter((file): file is HyperspaceFile => file instanceof HyperspaceFile);
  }
  soundWaveFiles: SoundFile[] = [];
  musicFiles: SoundFile[] = [];
  imgFiles: FtlImg[] = [];
  shipIconFiles: FtlShipIcon[] = [];
  shipRoomImageFiles: FtlShipRoomImage[] = [];
  personImageFiles: FtlImg[] = [];

  findMatchingImg(modFileRef: string): FtlImg | undefined {
    for (const ftlImg of this.imgFiles) {
      if (ftlImg.modPath == modFileRef) {
        return ftlImg;
      }
    }
    return;
  }

  hasHyperspace(): boolean {
    return this.hyperspaceFiles.length > 0;
  }

  clear() {
    this.xmlFiles.clear();
    this.soundWaveFiles.length = 0;
    this.musicFiles.length = 0;
    this.imgFiles.length = 0;
  }
}
