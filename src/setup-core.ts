import {getLanguageService, LanguageService} from 'vscode-html-languageservice';
import {DocumentCache} from './document-cache';
import {PathRefMappers} from './ref-mappers/path-ref-mapper';
import {Mappers} from './ref-mappers/mappers';
import {FtlXmlParser} from './parsers/ftl-xml-parser';
import {IncompleteTagParser} from './parsers/incomplete-tag-parser';
import {RequiredChildrenParser} from './parsers/required-children-parser';
import {AllowedChildrenParser} from './parsers/allowed-children-parser';
import {CustomEventFilesParser} from './parsers/custom-event-files-parser';
import {LookupProvider} from './ref-mappers/lookup-provider';
import {DataReceiver, FtlDataProvider} from './providers/ftl-data-provider';
import {IsReferencedUpdater} from './data-receivers/is-referenced-updater';
import {Validator} from './validators/validator';
import {EventUsedValidator} from './validators/event-used-validator';
import {BlueprintValidator} from './blueprints/blueprint-validator';
import {RefNameValidator} from './validators/ref-name-validator';
import {SoundFileNameValidator} from './validators/sound-file-name-validator';
import {ImgFileNameValidator} from './validators/img-file-name-validator';
import {AnimationValidator} from './validators/animation-validator';
import {FileOpener, FtlParser} from './ftl-parser';
import {FtlDatCache} from './dat-fs-provider/ftl-dat-cache';
import {FileReader} from './dat-fs-provider/dat-file-parser';

export interface FtlServices {
  parser: FtlParser;
  parsers: FtlXmlParser[];
  datCache: FtlDatCache;
  documentCache: DocumentCache;
  validators: Validator[];
  lookupProviders: LookupProvider[];
  htmlService: LanguageService;
  mappers: Mappers;
  pathMappers: PathRefMappers;
}


export function setupCore(fileOpener: FileOpener, fileReader: FileReader): FtlServices {
  const service = getLanguageService({useDefaultDataProvider: false});
  const documentCache = new DocumentCache(service);

  const pathMappers = new PathRefMappers();
  const mappers = new Mappers();
  const parsers: FtlXmlParser[] = [
    ...mappers.list.map((value) => value.parser),
    new IncompleteTagParser(),
    new RequiredChildrenParser(),
    new AllowedChildrenParser(),
    new CustomEventFilesParser()
  ];
  const lookupProviders: LookupProvider[] = [...mappers.list, ...pathMappers.mappers];
  const dataReceivers: DataReceiver[] = [...mappers.list, ...pathMappers.mappers, new IsReferencedUpdater()];

  const validators: Validator[] = [
    new EventUsedValidator(mappers.eventsMapper, mappers.shipsMapper),
    new BlueprintValidator(mappers.blueprintMapper),
    new RefNameValidator(mappers.list, mappers.blueprintMapper),
    new SoundFileNameValidator(),
    new ImgFileNameValidator(),
    new AnimationValidator(mappers)
  ];
  const ftlDataProvider = new FtlDataProvider(dataReceivers);
  const ftlParser = new FtlParser(
      documentCache,
      parsers,
      pathMappers.mappers,
      ftlDataProvider,
      fileOpener);
  const ftlDatCache = new FtlDatCache(fileReader);
  service.setDataProviders(false, [
    ftlDataProvider
  ]);

  return {
    parser: ftlParser,
    datCache: ftlDatCache,
    mappers,
    parsers,
    pathMappers,
    htmlService: service,
    documentCache,
    lookupProviders,
    validators
  };
}
