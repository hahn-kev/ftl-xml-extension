import vscode, {Uri} from 'vscode';
import {FtlDatFile} from './ftl-dat-file';
import {DatFileParser} from './dat-file-parser';

export class FtlDatCache {
  cache = new Map<string, Promise<FtlDatFile>>();

  async tryAdd(workspaceFolder: Uri) {
    if (this.cache.has(workspaceFolder.toString())) {
      return;
    }
    this.cache.set(workspaceFolder.toString(), new DatFileParser().parse(workspaceFolder));
  }

  async getDatFile(file: Uri): Promise<FtlDatFile> {
    const ftlDat = FtlDatFile.asDat(file);
    if (!ftlDat) throw vscode.FileSystemError.FileNotFound(file);
    let datFile = this.cache.get(ftlDat.toString());
    if (!datFile) {
      const p = new DatFileParser().parse(ftlDat);
      this.cache.set(ftlDat.toString(), p);
      datFile = p;
    }
    return await datFile;
  }
}
