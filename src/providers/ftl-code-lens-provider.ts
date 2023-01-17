import {CancellationToken, CodeLens, CodeLensProvider, Command, Location, TextDocument, Uri} from 'vscode';
import {FtlParser} from '../ftl-parser';
import {FtlFile, FtlFileValue} from '../models/ftl-file';
import {FtlValue} from '../models/ftl-value';
import {VscodeConverter} from '../vscode-converter';
import {Mappers} from '../ref-mappers/mappers';
import {AnimationPreview} from '../animation-preview/animation-preview';
import {RefMapperBase} from '../ref-mappers/ref-mapper';
import { FtlOutputChannel } from '../output/ftl-output-channel';

export class FtlCodeLensProvider implements CodeLensProvider {
  constructor(private parser: FtlParser, private mappers: Mappers, private output: FtlOutputChannel) {

  }

  public async provideCodeLenses(document: TextDocument, token: CancellationToken): Promise<CodeLens[] | undefined> {
    const files = await this.parser.files;
    this.output.time('provide Code Lenses');
    if (token.isCancellationRequested) return;
    const file = files.get(document.uri.toString());
    if (!file) return;

    const lenses = [
      ...this.referenceLenses(file, document.uri),
      ...this.animationPreviewLenses(file)
    ];
    this.output.timeEnd('provide Code Lenses');
    return lenses;
  }

  private* animationPreviewLenses(file: FtlFile) {
    for (const def of file.animations.defs) {
      yield new CodeLens(VscodeConverter.toVscodeRange(def.range),
          {title: 'Preview Animation', command: AnimationPreview.OpenPreviewCommand, arguments: [def.name, 'anim']});
    }
    for (const def of file.weaponAnimations.defs) {
      yield new CodeLens(VscodeConverter.toVscodeRange(def.range),
          {
            title: 'Preview Animation',
            command: AnimationPreview.OpenPreviewCommand,
            arguments: [def.name, 'weaponAnim']
          });
    }
  }

  private referenceLenses(file: FtlFile, uri: Uri) {
    const fileValues: FtlFileValue<FtlValue>[] = [
      file.event,
      file.ship,
      file.shipBlueprint,
      file.weapon,
      file.drone,
      file.animations,
      file.augment,
      file.blueprintList,
      file.system
    ];
    const lenses: CodeLens[] = [];
    for (const fileValue of fileValues) {
      const mapper = this.determineMapper(file, fileValue);
      if (!mapper) continue;
      for (const def of fileValue.defs) {
        const refs = this.findRefs(def, mapper);
        if (!refs || refs.length == 0) continue;
        lenses.push(this.defToCodeLense(def, uri, refs));
      }
    }

    return lenses;
  }

  private findRefs(def: FtlValue, mapper: RefMapperBase): FtlValue[] {
    const refs = (this.mappers.blueprintMapper == mapper)
        ? this.mappers.blueprintMapper.getRefsByName(def.name)
        : mapper.refs.get(def.name);
    return refs?.filter(r => r !== def) ?? [];
  }

  private determineMapper(file: FtlFile, fileValue: FtlFileValue<FtlValue>) {
    const mapper = this.mappers.list.find(m => m.parser.fileDataSelector(file) === fileValue);
    if (mapper) return mapper;
    const isBlueprintMapper = this.mappers.blueprintMappers.some(m => m.parser.fileDataSelector(file) === fileValue);
    return isBlueprintMapper ? this.mappers.blueprintMapper : undefined;
  }

  private defToCodeLense(def: FtlValue, uri: Uri, refs: FtlValue[]) {
    const locations: Location[] = refs.map(r => new Location(Uri.parse(r.file.uri),
        VscodeConverter.toVscodeRange(r.range)));
    const command: Command = {
      title: `${refs.length} references`,
      command: 'editor.action.showReferences',
      arguments: [uri, def.range.start, locations]
    };
    return new CodeLens(VscodeConverter.toVscodeRange(def.range), command);
  }
}
