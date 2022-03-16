import {IValueSet, Location} from 'vscode-html-languageservice';
import {FtlRoot} from '../models/ftl-root';
import {getNodeTextContent, shouldCompleteForNodeContents} from '../helpers';
import {FtlImg} from '../models/ftl-img';
import {SoundFile} from '../models/sound-file';
import {ImgPathNames, MusicPaths, ShipIconFileNames, SoundWavePaths} from '../data/autocomplete-value-sets';
import {FtlResourceFile} from '../models/ftl-resource-file';
import {LookupContext, LookupProvider} from './lookup-provider';
import {defaultSoundFiles} from '../data/default-ftl-data/default-sound-files';
import {defaultImgFiles} from '../data/default-ftl-data/default-img-files';
import {defaultMusic} from '../data/default-ftl-data/default-music';
import {NodeMapContext} from './node-map';
import {DataReceiver} from '../providers/ftl-data-provider';
import {URI} from 'vscode-uri';
import {Mappers} from './mappers';
import {Sounds} from '../sounds';
import {FtlShipIcon} from '../models/ftl-ship-icon';

export enum FileHandled {
  handled,
  notHandled
}

export interface PathRefMapperBase extends LookupProvider, DataReceiver {
  handleFile(file: URI, fileName: string, root: FtlRoot, fileRemoved: boolean): FileHandled;
}

export class PathRefMapper<T extends FtlResourceFile> implements PathRefMapperBase {
  public root: FtlRoot = new FtlRoot();

  constructor(public readonly typeName: string,
              public readonly autoCompleteValues: IValueSet,
              private readonly matchingFile: (file: URI, fileName: string) => boolean,
              private readonly resourceBuilder: { new(file: URI): T; },
              private readonly selectRootFiles: (root: FtlRoot) => T[],
              private readonly defaultFiles: string[] = [],
              private readonly getFileRef: (context: NodeMapContext) => string | undefined = () => undefined,
              private readonly findFile: (refName: string, files: T[], context: NodeMapContext) => T | undefined) {
  }

  public handleFile(file: URI, fileName: string, root: FtlRoot, fileRemoved: boolean): FileHandled {
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
    const img = this.lookupFile(context);
    if (!img) return;
    return {uri: img.uri.toString(), range: {start: {line: 0, character: 0}, end: {line: 0, character: 0}}};
  }

  lookupFile(context: NodeMapContext): T | undefined {
    const refName = this.getFileRef(context);
    if (refName) {
      return this.findFile(refName, this.selectRootFiles(this.root), context);
    }
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
        return fileName.endsWith('.png');
      },
      FtlImg,
      (root) => root.imgFiles,
      defaultImgFiles,
      (c) => getNodeTextContent(c.node, c.document, 'animSheet')
          ?? getNodeTextContent(c.node, c.document, 'img')
          ?? getNodeTextContent(c.node, c.document, 'chargeImage'),
      (refName, files) => files.find((f) => f.matches(refName))
  );

  shipIconMapper = new PathRefMapper('Ship Icon',
      ShipIconFileNames,
      (file, fileName) => fileName.endsWith('.png') && file.path.endsWith('img/combatUI/icons/' + fileName),
      FtlShipIcon,
      (root) => root.shipIconFiles,
      [],
      (c) => Mappers.shipIconNodeMap.getNameDef(c.node, c.document, c.position),
      (refName, files) => files.find((f) => f.modPath == refName)
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
      defaultMusic,
      (c) => getNodeTextContent(c.node, c.document, 'explore', 'track')
          ?? getNodeTextContent(c.node, c.document, 'combat', 'track'),
      (refName, files) => files.find((f) => f.modPath == refName)
  );

  soundMapper = new PathRefMapper('Sound',
      SoundWavePaths,
      (file, fileName) => {
        if (!fileName?.endsWith('.ogg') && !fileName?.endsWith('.wav')) return false;
        const soundFile = new SoundFile(file);
        return soundFile.type === 'wave';
      },
      SoundFile,
      (root) => root.soundWaveFiles,
      defaultSoundFiles,
      (c) => {
        if (!Sounds.isWaveNode(c.node, c.document)
            || (c.position && !shouldCompleteForNodeContents(c.node, c.document.offsetAt(c.position)))) return;
        return getNodeTextContent(c.node, c.document);
      },
      (refName, files) => files.find((f) => f.modPath == refName)
  );
  mappers: PathRefMapperBase[] = [this.imageMapper, this.soundMapper, this.musicMapper, this.shipIconMapper];
}
