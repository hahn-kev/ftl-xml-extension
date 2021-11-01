import {
    IAttributeData,
    IHTMLDataProvider,
    ITagData,
    IValueData,
    newHTMLDataProvider
} from "vscode-html-languageservice";
import {FtlData, EventNamesValueSet, ShipNames} from './data/ftl-data';
import {FtlFile} from './models/ftl-file';
import {Event} from 'vscode';
import {defaultEvents} from './data/default-events';
import {defaultShips} from './data/default-ships';

export class FtlDataProvider implements IHTMLDataProvider {

    constructor(onFileParsed: Event<{ file: FtlFile; files: Map<string, FtlFile> }>) {
        onFileParsed(e => {
            this.updateFtlData(e.files);
        });
    }

    updateFtlData(files: Map<string, FtlFile>) {
        let ftlFiles = Array.from(files.values());
        this.updateEvents(ftlFiles);
        this.updateShips(ftlFiles);
    }

    private updateEvents(ftlFiles: FtlFile[]) {
        let eventValues = EventNamesValueSet.values;
        eventValues.length = 0;
        let customEventNames = ftlFiles.flatMap(value => value.events).map(event => event.name);
        eventValues.push(...customEventNames.concat(defaultEvents).map(eventName => ({name: eventName})));
    }

    private updateShips(ftlFiles: FtlFile[]) {
        let shipValues = ShipNames.values;
        shipValues.length = 0;
        let customShipNames = ftlFiles.flatMap(value => value.ships).map(ship => ship.name);
        shipValues.push(...customShipNames.concat(defaultShips).map(shipName => ({name: shipName})));
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
        let results = this.htmlDataProvider.provideValues(tag, attribute);
        return results;
    }
}
