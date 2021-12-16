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
import {PathRefMapperBase} from '../ref-mappers/path-ref-mapper';

export class FtlDataProvider implements IHTMLDataProvider {
  constructor(onParsed: Event<FtlRoot>, private mappers: RefMapperBase[], private pathRefMappers: PathRefMapperBase[]) {
    onParsed((e) => {
      console.time('update data');
      this.updateFtlData(e);
      console.timeEnd('update data');
    });
  }

  updateFtlData(root: FtlRoot) {
    for (const pathRefMapper of this.pathRefMappers) {
      pathRefMapper.updateData(root);
    }

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
