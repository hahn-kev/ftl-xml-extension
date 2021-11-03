import {
    IAttributeData,
    IHTMLDataProvider,
    ITagData,
    IValueData,
    newHTMLDataProvider
} from "vscode-html-languageservice";
import {FtlData} from './data/ftl-data';
import {FtlFile} from './models/ftl-file';
import {Event} from 'vscode';
import {mappers} from './ref-mappers/mappers';

export class FtlDataProvider implements IHTMLDataProvider {

    constructor(onFileParsed: Event<{ file: FtlFile; files: Map<string, FtlFile> }>) {
        onFileParsed(e => {
            this.updateFtlData(e.files);
        });
    }

    updateFtlData(files: Map<string, FtlFile>) {
        let ftlFiles = Array.from(files.values());
        for (let mapper of mappers) {
            mapper.updateData(ftlFiles);
        }
    }

    htmlDataProvider = newHTMLDataProvider('ftl-data', FtlData);

    getId(): string {
        return "ftl-data";
    }

    isApplicable(languageId: string): boolean {
        return languageId == "ftl-xml";
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
