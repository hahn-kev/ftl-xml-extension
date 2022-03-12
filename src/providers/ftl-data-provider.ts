import {
  IAttributeData,
  IHTMLDataProvider,
  ITagData,
  IValueData,
  newHTMLDataProvider
} from 'vscode-html-languageservice';
import {FtlData} from '../data/ftl-data';
import {FtlRoot} from '../models/ftl-root';

export interface DataReceiver {
  updateData(root: FtlRoot): void;
}

export interface IFtlDataProvider {
  updateFtlData(root: FtlRoot): void;
}

export class FtlDataProvider implements IHTMLDataProvider, IFtlDataProvider {
  constructor(private receivers: DataReceiver[]) {
  }

  public updateFtlData(root: FtlRoot) {
    console.time('update data');
    for (const receiver of this.receivers) {
      receiver.updateData(root);
    }
    console.timeEnd('update data');
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
