import {IValueSet, Location} from 'vscode-html-languageservice';
import {FtlRoot} from '../models/ftl-root';
import {getNodeTextContent, shouldCompleteForNodeContents} from '../helpers';
import {FtlImg} from '../models/ftl-img';
import {SoundFile} from '../models/sound-file';
import {ImgPathNames, MusicPaths, SoundWavePaths} from '../data/autocomplete-value-sets';
import {FtlResourceFile} from '../models/ftl-resource-file';
import {LookupContext, LookupProvider} from './lookup-provider';
import {defaultSoundFiles} from '../data/default-ftl-data/default-sound-files';
import {defaultImgFiles} from '../data/default-ftl-data/default-img-files';
import {defaultMusic} from '../data/default-ftl-data/default-music';
import {NodeMapContext} from './node-map';
import {DataReceiver} from '../providers/ftl-data-provider';
import {URI} from 'vscode-uri';

export enum FileHandled {
  handled,
  notHandled
}

export interface PathRefMapperBase extends LookupProvider, DataReceiver {
  handleFile(file: URI, fileName: string | undefined, root: FtlRoot, fileRemoved: boolean): FileHandled;
}

export class PathRefMapper<T extends FtlResourceFile> implements PathRefMapperBase {
  public root: FtlRoot = new FtlRoot();

  constructor(public readonly typeName: string,
              public readonly autoCompleteValues: IValueSet,
              private readonly matchingFile: (file: URI, fileName: string | undefined) => boolean,
              private readonly resourceBuilder: { new(file: URI): T; },
              private readonly selectRootFiles: (root: FtlRoot) => T[],
              private readonly defaultFiles: string[] = []) {
  }

  public handleFile(file: URI, fileName: string | undefined, root: FtlRoot, fileRemoved: boolean): FileHandled {
    if (!this.matchingFile(file, fileName)) return FileHandled.notHandled;
    if (fileRemoved) {
      const rootFiles = this.selectRootFiles(root);
      const fileIndex = rootFiles.findIndex((resource) => resource.uri.toString() == file.toString());
      if (fileIndex !== -1) rootFiles.splice(fileIndex, 1);
    } else {
      this.selectRootFiles(root).push(new this.resourceBuilder(file));
    }
    return FileHandled.handled;
  }

  public lookupDef(context: LookupContext): Location | undefined {
    const img = this.lookupImg(context);
    if (!img) return;
    return {uri: img.uri.toString(), range: {start: {line: 0, character: 0}, end: {line: 0, character: 0}}};
  }

  lookupImg({node, document, position}: NodeMapContext): FtlImg | undefined {
    if (node.tag == 'animSheet' || node.tag == 'img' || node.tag == 'chargeImage') {
      if (position && !shouldCompleteForNodeContents(node, document.offsetAt(position))) return;

      const imgPathName = getNodeTextContent(node, document);
      if (!imgPathName) return;
      return this.root.findMatchingImg(imgPathName);
    }
    return undefined;
  }

  public lookupRefs({node, document, position}: LookupContext): Location[] | undefined {
    // todo implement
    const offset = document.offsetAt(position);
    return undefined;
  }

  public updateData(root: FtlRoot): void {
    this.root = root;
    this.autoCompleteValues.values.length = 0;
    this.autoCompleteValues.values.push(...this.selectRootFiles(root)
        .map((file) => file.modPath)
        .concat(this.defaultFiles)
        .map((modPath) => ({name: modPath}))
    );
    // todo update autocomplete value sets
  }
}

export class PathRefMappers {
  imageMapper = new PathRefMapper('Image',
      ImgPathNames,
      (file, fileName) => {
        return fileName?.endsWith('.png') ?? false;
      },
      FtlImg,
      (root) => root.imgFiles,
      defaultImgFiles,
  );

  musicMapper = new PathRefMapper('Music',
      MusicPaths,
      (file, fileName) => {
        if (!fileName?.endsWith('.ogg') && !fileName?.endsWith('.wav')) return false;
        const soundFile = new SoundFile(file);
        return soundFile.type === 'music';
      },
      SoundFile,
      (root) => root.musicFiles,
      defaultMusic);

  soundMapper = new PathRefMapper('Sound',
      SoundWavePaths,
      (file, fileName) => {
        if (!fileName?.endsWith('.ogg') && !fileName?.endsWith('.wav')) return false;
        const soundFile = new SoundFile(file);
        return soundFile.type === 'wave';
      },
      SoundFile,
      (root) => root.soundWaveFiles,
      defaultSoundFiles);
  mappers: PathRefMapperBase[] = [this.imageMapper, this.soundMapper, this.musicMapper];
}
