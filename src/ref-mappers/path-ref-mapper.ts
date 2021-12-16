import {IValueSet} from 'vscode-html-languageservice';
import {Location, Range, Uri} from 'vscode';
import {FtlRoot} from '../models/ftl-root';
import {getNodeTextContent} from '../helpers';
import {FtlImg} from '../models/ftl-img';
import {SoundFile} from '../models/sound-file';
import {FtlCompletionProvider} from '../providers/ftl-completion-provider';
import {ImgPathNames, MusicPaths, SoundWavePaths} from '../data/autocomplete-value-sets';
import {FtlResourceFile} from '../models/ftl-resource-file';
import {LookupContext, LookupProvider} from './lookup-provider';
import {defaultSoundFiles} from '../data/default-ftl-data/default-sound-files';
import {defaultImgFiles} from '../data/default-ftl-data/default-img-files';
import {defaultMusic} from '../data/default-ftl-data/default-music';

export enum FileHandled {
  handled,
  notHandled
}

export interface PathRefMapperBase extends LookupProvider {
  handleFile(file: Uri, fileName: string | undefined, root: FtlRoot): FileHandled;

  updateData(root: FtlRoot): void;
}

export class PathRefMapper<T extends FtlResourceFile> implements PathRefMapperBase {
  public root: FtlRoot = new FtlRoot();

  constructor(public readonly typeName: string,
              public readonly autoCompleteValues: IValueSet,
              private readonly matchingFile: (file: Uri, fileName: string | undefined) => boolean,
              private readonly resourceBuilder: { new(file: Uri): T; },
              private readonly selectRootFiles: (root: FtlRoot) => T[],
              private readonly defaultFiles: string[] = []) {
  }

  public handleFile(file: Uri, fileName: string | undefined, root: FtlRoot): FileHandled {
    if (!this.matchingFile(file, fileName)) return FileHandled.notHandled;
    this.selectRootFiles(root).push(new this.resourceBuilder(file));
    return FileHandled.handled;
  }

  public lookupDef({node, document, position}: LookupContext): Location | undefined {
    const offset = document.offsetAt(position);
    if ((node.tag == 'animSheet' || node.tag == 'img' || node.tag == 'chargeImage')
        && FtlCompletionProvider.shouldCompleteForNodeContents(node, offset)) {
      const imgPathName = getNodeTextContent(node, document);
      if (!imgPathName) return;
      const img = this.root.findMatchingImg(imgPathName);
      if (!img) return;
      return new Location(img.uri, new Range(0, 0, 0, 0));
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

class PathRefMappers {
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

export const pathMappers = new PathRefMappers();
