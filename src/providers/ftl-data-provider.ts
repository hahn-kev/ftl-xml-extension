import {
  IAttributeData,
  IHTMLDataProvider,
  ITagData,
  IValueData,
  newHTMLDataProvider
} from 'vscode-html-languageservice';
import {FtlData} from '../data/ftl-data';
import {FtlFile} from '../models/ftl-file';
import {Event} from 'vscode';
import {RefMapperBase} from '../ref-mappers/ref-mapper';

export class FtlDataProvider implements IHTMLDataProvider {
  constructor(onFileParsed: Event<{ files: Map<string, FtlFile> }>, private mappers: RefMapperBase[]) {
    onFileParsed((e) => {
      console.time('update data');
      this.updateFtlData(e.files);
      console.timeEnd('update data');
    });
  }

  updateFtlData(files: Map<string, FtlFile>) {
    const ftlFiles = Array.from(files.values());
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
