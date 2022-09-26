import {IValueData} from 'vscode-html-languageservice';
import {AllBlueprintsValueSet, ReqNames} from '../data/autocomplete-value-sets';
import {FtlRoot} from '../models/ftl-root';
import {DataReceiver} from '../providers/ftl-data-provider';
import {Mappers} from '../ref-mappers/mappers';

export class ReqListUpdater implements DataReceiver {
  constructor(private mappers: Mappers) {
  }
  updateData(root: FtlRoot): void {
    ReqNames.values.length = 0;

    ReqNames.values.push(
        ...AllBlueprintsValueSet.values,
        ...this.mappers.sectorMapper.autoCompleteValues.values.map(v => ({...v, name: `SEC ${v.name}`} as IValueData)),
    );
  }
}
