import vscode, {Uri} from 'vscode';
import {FtlDatFile} from './ftl-dat-file';

export class FtlDatCache {
  cache = new Map<string, FtlDatFile>();

  tryAdd(workspaceFolder: Uri) {
    if (this.cache.has(workspaceFolder.toString())) {
      return;
    }
    this.cache.set(workspaceFolder.toString(), new FtlDatFile(workspaceFolder));
  }

  getDatFile(file: Uri): FtlDatFile {
    const ftlDat = FtlDatFile.asDat(file);
    if (!ftlDat) throw vscode.FileSystemError.FileNotFound(file);
    let datFile = this.cache.get(ftlDat.toString());
    if (!datFile) {
      datFile = new FtlDatFile(ftlDat);
      this.cache.set(ftlDat.toString(), datFile);
    }
    if (!datFile) throw vscode.FileSystemError.FileNotFound(file);
    return datFile;
  }
}
