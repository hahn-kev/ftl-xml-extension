import {DataReceiver} from '../providers/ftl-data-provider';
import {FtlRoot} from '../models/ftl-root';
import {defaultXmlFilesAndAppends} from '../data/default-ftl-data/default-xml-files';
import {getFileName} from '../helpers';
import {FtlFile} from '../models/ftl-file';
import {defaultShipLayouts} from '../data/default-ftl-data/default-ship-layouts';
import {HyperspaceFile} from '../models/hyperspace-file';

export class IsReferencedUpdater implements DataReceiver {
  public updateData(root: FtlRoot): void {
    const hyperspaceFiles = root.hyperspaceFiles;
    const emptySet = new Set<string>();
    // first pass to determine which files to use to include as auto blueprints
    for (const file of root.xmlFiles.values()) {
      file.isReferenced = this.isReferenced(file, emptySet, hyperspaceFiles);
    }
    // now that we know which files are referenced we can use them to determine which layout files are referenced
    const shipLayouts = new Set(Array.from(root.xmlFiles.values())
        .filter((file) => file.isReferenced)
        .flatMap((file) => file.autoBlueprint.defs.map((ship) => ship.layout))
        .filter((layout): layout is string => !!layout)
        .concat(defaultShipLayouts));
    for (const file of root.xmlFiles.values()) {
      // skip already referenced files, we're just trying to catch ship layout files
      if (file.isReferenced) continue;
      file.isReferenced = this.isReferenced(file, shipLayouts, hyperspaceFiles);
    }
  }

  isReferenced(file: FtlFile, shipLayouts: Set<string>, hyperspaceFiles: HyperspaceFile[]) {
    const fileName = file.fileName;
    if (defaultXmlFilesAndAppends.includes(fileName)) return true;
    const trimEndBy = fileName.endsWith('.xml.append') ? '.xml.append'.length : '.xml'.length;
    const nameAsShipLayout = fileName.substring(0, fileName.length - trimEndBy);
    if (shipLayouts.has(nameAsShipLayout)) return true;

    if (hyperspaceFiles.length > 0) {
      // covert file name like this: 'events_store.xml' into 'store'
      const customEventRefName = fileName.substring('events_'.length, fileName.length - trimEndBy);
      return hyperspaceFiles.some((hyperspaceFile) => hyperspaceFile.customEventFiles.has(customEventRefName));
    }
    return false;
  }
}
