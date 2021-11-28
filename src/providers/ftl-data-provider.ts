import {
  IAttributeData,
  IHTMLDataProvider,
  ITagData,
  IValueData,
  newHTMLDataProvider
} from 'vscode-html-languageservice';
import {FtlData} from '../data/ftl-data';
import {Event} from 'vscode';
import {RefMapperBase} from '../ref-mappers/ref-mapper';
import {FtlRoot} from '../models/ftl-root';
import {MusicPaths, SoundWavePaths} from '../data/autocomplete-value-sets';

export class FtlDataProvider implements IHTMLDataProvider {
  constructor(onParsed: Event<FtlRoot>, private mappers: RefMapperBase[]) {
    onParsed((e) => {
      console.time('update data');
      this.updateFtlData(e);
      console.timeEnd('update data');
    });
  }

  updateFtlData(root: FtlRoot) {
    SoundWavePaths.values.length = 0;
    SoundWavePaths.values.push(...root.soundWaveFiles.map((file) => ({name: file.modPath})));
    MusicPaths.values.length = 0;
    MusicPaths.values.push(...root.musicFiles.map((file) => ({name: file.modPath})));

    const ftlFiles = Array.from(root.files.values());
    for (const mapper of this.mappers) {
      mapper.updateData(ftlFiles);
    }
  }

  htmlDataProvider = newHTMLDataProvider('ftl-data', FtlData);

  getId(): string {
    return 'ftl-data';
  }

  isApplicable(languageId: string): boolean {
    return languageId == 'ftl-xml';
  }

  provideTags(): ITagData[] {
    return this.htmlDataProvider.provideTags();
  }

  provideAttributes(tag: string): IAttributeData[] {
    return this.htmlDataProvider.provideAttributes(tag);
  }

  provideValues(tag: string, attribute: string): IValueData[] {
    return this.htmlDataProvider.provideValues(tag, attribute);
  }
}
