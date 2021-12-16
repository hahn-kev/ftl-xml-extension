import {
  IAttributeData,
  IHTMLDataProvider,
  ITagData,
  IValueData,
  newHTMLDataProvider
} from 'vscode-html-languageservice';
import {FtlData} from '../data/ftl-data';
import {Event} from 'vscode';
import {FtlRoot} from '../models/ftl-root';

export interface DataReceiver {
  updateData(root: FtlRoot): void;
}

export class FtlDataProvider implements IHTMLDataProvider {
  constructor(onParsed: Event<FtlRoot>, private receivers: DataReceiver[]) {
    onParsed((e) => {
      console.time('update data');
      this.updateFtlData(e);
      console.timeEnd('update data');
    });
  }

  updateFtlData(root: FtlRoot) {
    for (const receiver of this.receivers) {
      receiver.updateData(root);
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
