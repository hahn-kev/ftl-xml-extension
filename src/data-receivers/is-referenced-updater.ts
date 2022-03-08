import {DataReceiver} from '../providers/ftl-data-provider';
import {FtlRoot} from '../models/ftl-root';
import {defaultXmlFilesAndAppends} from '../data/default-ftl-data/default-xml-files';
import {getFileName} from '../helpers';
import {FtlFile} from '../models/ftl-file';
import {defaultShipLayouts} from '../data/default-ftl-data/default-ship-layouts';

export class IsReferencedUpdater implements DataReceiver {
  public updateData(root: FtlRoot): void {
    const emptySet = new Set<string>();
    // first pass to determine which files to use to include as auto blueprints
    for (const file of root.xmlFiles.values()) {
      file.isReferenced = this.isReferenced(file, emptySet);
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
      file.isReferenced = this.isReferenced(file, shipLayouts);
    }
  }

  isReferenced(file: FtlFile, shipLayouts: Set<string>) {
    const fileName = getFileName(file.uri);
    if (fileName == 'hyperspace.xml') return true;
    if (defaultXmlFilesAndAppends.includes(fileName)) return true;
    const nameAsShipLayout = fileName.substring(0, fileName.length - '.xml'.length);
    if (shipLayouts.has(nameAsShipLayout)) return true;
    if (file.root.hyperspaceFile) {
      // covert file name like this: 'events_store.xml' into 'store'
      const customEventRefName = fileName.substring('events_'.length, fileName.length - '.xml'.length);
      return file.root.hyperspaceFile.customEventFiles.has(customEventRefName);
    }
    return false;
  }
}
