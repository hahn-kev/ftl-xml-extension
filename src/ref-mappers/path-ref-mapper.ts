import {IValueSet, Location} from 'vscode-html-languageservice';
import {FtlRoot} from '../models/ftl-root';
import {contains, getAttrValue, getAttrValueForTag, getNodeContent, shouldCompleteForNodeContents} from '../helpers';
import {FtlImg} from '../models/ftl-img';
import {SoundFile} from '../models/sound-file';
import {ImgPathNames, MusicPaths, ShipIconFileNames, ShipRoomImageFileNames, SoundWavePaths} from '../data/autocomplete-value-sets';
import {FtlResourceFile} from '../models/ftl-resource-file';
import {LookupContext, LookupProvider} from './lookup-provider';
import {defaultSoundFiles} from '../data/default-ftl-data/default-sound-files';
import {defaultImgFiles} from '../data/default-ftl-data/default-img-files';
import {defaultMusic} from '../data/default-ftl-data/default-music';
import {DataReceiver} from '../providers/ftl-data-provider';
import {URI} from 'vscode-uri';
import {Mappers} from './mappers';
import {Sounds} from '../sounds';
import {FtlShipIcon} from '../models/ftl-ship-icon';
import {NodeMapContext} from './node-mapping/node-map-context';
import {ValueName} from './value-name';
import { FtlShipRoomImage } from '../models/ftl-ship-room-image';
import { declarationBasedMapFunction } from './node-mapping/declaration-node-map';
import { FtlXmlParser, ParseContext } from '../parsers/ftl-xml-parser';
import { FtlFile } from '../models/ftl-file';
import { DiagnosticBuilder } from '../diagnostic-builder';
import { defaultRoomImages } from '../data/default-ftl-data/default-room-images';

export enum FileHandled {
  handled,
  notHandled
}

export interface PathRefMapperBase extends LookupProvider, DataReceiver, FtlXmlParser {
  handleFile(file: URI, fileName: string, root: FtlRoot, fileRemoved: boolean): FileHandled;
  lookupFile(context: LookupContext): {file?: FtlResourceFile, ref?: ValueName}
}

export class PathRefMapper<T extends FtlResourceFile> implements PathRefMapperBase {
  public root: FtlRoot = new FtlRoot();

  constructor(public readonly typeName: string,
              public readonly autoCompleteValues: IValueSet,
              private readonly matchingFile: (file: URI, fileName: string) => boolean,
              private readonly resourceBuilder: { new(file: URI): T; },
              private readonly selectRootFiles: (root: FtlRoot) => T[],
              private readonly defaultFiles: string[] = [],
              private readonly getFileRef: (context: NodeMapContext) => ValueName | undefined = () => undefined,
              private readonly findFile: (refName: string, files: T[]) => T | undefined) {
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
    const {file} = this.lookupFile(context);
    if (!file) return;
    return {uri: file.uri.toString(), range: {start: {line: 0, character: 0}, end: {line: 0, character: 0}}};
  }

  lookupFile(context: LookupContext): {file?: T, ref?: ValueName} {
    const refName = this.getFileRef(context);
    if (refName && contains(refName.range, context.position)) {
      return {
        file: this.findFile(refName.name, this.selectRootFiles(this.root)),
        ref: refName
      };
    }
    return {};
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

    //validate all custom refs
    for (const xmlFile of root.xmlFiles.values()) {
      const refs = this.getRefsToValidate(xmlFile);
      for (const ref of refs) {
        if (this.defaultFiles.includes(ref.name)) continue;
        const resourceFile = this.findFile(ref.name, this.selectRootFiles(this.root));
        if (!resourceFile) {
          xmlFile.diagnostics.push(
            DiagnosticBuilder.invalidRefName(ref.name, ref.range, this.typeName)
          )
        }
      }
    }
  }


  parseNode(context: ParseContext): void | FtlXmlParser {
    const ref = this.getFileRef(context);
    if (!ref || this.defaultFiles.includes(ref.name)) return;
    const fileData = this.getRefsToValidate(context.file);
    fileData.push(ref);
  }
  
  private customDataSymbol = Symbol(this.typeName);
  private getRefsToValidate(file: FtlFile): ValueName[] {
    const data = file.customData[this.customDataSymbol];
    if (data) return data;
    return file.customData[this.customDataSymbol] = [];
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
      (c) => getNodeContent(c.node, c.document, 'animSheet', '!race')
          ?? getNodeContent(c.node, c.document, 'img')
          ?? getNodeContent(c.node, c.document, 'chargeImage'),
      (refName, files) => files.find((f) => f.matches(refName))
  );

  shipIconMapper = new PathRefMapper('Ship Icon',
      ShipIconFileNames,
      (file, fileName) => fileName.endsWith('.png') && file.path.endsWith('img/combatUI/icons/' + fileName),
      FtlShipIcon,
      (root) => root.shipIconFiles,
      [],
      (c) => Mappers.shipIconNodeMap.getNameDef(c),
      (refName, files) => files.find((f) => f.modPath == refName)
  );

  shipRoomImageMapper = new PathRefMapper('Ship Room Image',
      ShipRoomImageFileNames,
      (file, fileName) => fileName.endsWith('.png') && file.path.endsWith('img/ship/interior/' + fileName),
      FtlShipRoomImage,
      (root) => root.shipRoomImageFiles,
      defaultRoomImages,
      declarationBasedMapFunction(ShipRoomImageFileNames),
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
      (c) => getNodeContent(c.node, c.document, 'explore', 'track')
          ?? getNodeContent(c.node, c.document, 'combat', 'track'),
      (refName, files) => files.find((f) => f.modPath == refName)
  );

  validSoundExtensions = ['.ogg', '.wav', '.mp3'];
  soundMapper = new PathRefMapper('Sound',
      SoundWavePaths,
      (file, fileName) => {
        if (!fileName || !this.validSoundExtensions.some(ext => fileName.endsWith(ext))) return false;
        const soundFile = new SoundFile(file);
        return soundFile.type === 'wave';
      },
      SoundFile,
      (root) => root.soundWaveFiles,
      defaultSoundFiles,
      (c) => {
        if (!Sounds.isWaveNode(c.node, c.document)) return;
        return getNodeContent(c.node, c.document);
      },
      (refName, files) => files.find((f) => f.modPath == refName)
  );
  mappers: PathRefMapperBase[] = [
    this.imageMapper,
    this.soundMapper,
    this.musicMapper,
    this.shipIconMapper,
    this.shipRoomImageMapper
  ];
}
