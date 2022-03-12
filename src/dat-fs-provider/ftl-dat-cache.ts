import {URI} from 'vscode-uri';
import {FtlDatFile} from './ftl-dat-file';
import {DatFileParser, FileReader} from './dat-file-parser';

export class FtlDatCache {
  cache = new Map<string, Promise<FtlDatFile>>();


  constructor(private fileReader: FileReader) {
  }

  async tryAdd(datFileUri: URI) {
    if (this.cache.has(datFileUri.toString())) {
      return;
    }
    this.cache.set(datFileUri.toString(), new DatFileParser(datFileUri, this.fileReader).parse());
  }

  async getDatFile(file: URI): Promise<FtlDatFile> {
    const datFileUri = FtlDatFile.getDatUri(file);
    if (!datFileUri) throw new Error(file.toString());
    let ftlDatFile = this.cache.get(datFileUri.toString());
    if (!ftlDatFile) {
      ftlDatFile = new DatFileParser(datFileUri, this.fileReader).parse();
      this.cache.set(datFileUri.toString(), ftlDatFile);
    }
    return await ftlDatFile;
  }
}
