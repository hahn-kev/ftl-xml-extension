import {FileSystemError, Uri} from 'vscode';
import {FtlDatFile} from './ftl-dat-file';
import {DatFileParser} from './dat-file-parser';

export class FtlDatCache {
  cache = new Map<string, Promise<FtlDatFile>>();

  async tryAdd(datFileUri: Uri) {
    if (this.cache.has(datFileUri.toString())) {
      return;
    }
    this.cache.set(datFileUri.toString(), new DatFileParser(datFileUri).parse());
  }

  async getDatFile(file: Uri): Promise<FtlDatFile> {
    const datFileUri = FtlDatFile.getDatUri(file);
    if (!datFileUri) throw FileSystemError.FileNotFound(file);
    let ftlDatFile = this.cache.get(datFileUri.toString());
    if (!ftlDatFile) {
      ftlDatFile = new DatFileParser(datFileUri).parse();
      this.cache.set(datFileUri.toString(), ftlDatFile);
    }
    return await ftlDatFile;
  }
}
