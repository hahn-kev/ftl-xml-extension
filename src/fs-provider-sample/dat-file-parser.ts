import {FileType, Uri, workspace} from 'vscode';
import {File} from './file';
import {FtlDatFile} from './ftl-dat-file';
import {Directory} from './directory';

export class DatFileParser {
  /** Bitmask flag for "deflate" compression. */
  private static PKGF_DEFLATED = 1 << 24;

  /** Fixed byte count of PKG headers. */
  private static HEADER_SIZE = 16;

  /** Fixed byte count of PKG entries. */
  private static ENTRY_SIZE = 20;

  /** Byte count to pre-allocate per innerPath in newly created dats. */
  private static TYPICAL_PATH_LENGTH = 70;
  private static readonly signature = [0x50, 0x4B, 0x47, 0x0A];// "PKG\n"
  private buffer!: Buffer;
  private offset = 0;
  private datFile!: FtlDatFile;

  public async parse(workspaceFolder: Uri): Promise<FtlDatFile> {
    this.datFile = new FtlDatFile(workspaceFolder);
    const uint8Array = await workspace.fs.readFile(workspaceFolder.with({scheme: 'file'}));
    this.buffer = Buffer.from(uint8Array);
    const entries = this.readIndex();
    for (const entry of entries) {
      this.addEntry(entry);
    }
    return this.datFile;
  }

  addEntry(entry: PkgEntry | undefined) {
    if (!entry) return;
    const parts = entry.innerPath.split('/');
    const fileName = parts[parts.length - 1];
    const dir = this.getDir(parts);
    const file = new File(fileName);
    file.size = entry.dataSize;
    file.data = entry.data;
    dir.entries.set(fileName, file);
  }

  getDir(parts: string[]): Directory {
    const fileName = parts[parts.length - 1];
    let dir: Directory = this.datFile;
    for (const part of parts) {
      if (part == fileName) return dir;
      let child = dir.entries.get(part);
      if (!child) {
        child = new Directory(part);
        dir.entries.set(part, child);
      }
      if (child.type == FileType.File) {
        throw new Error(`path ${part} is a file and should be a directory`);
      }
      dir = child;
    }
    return dir;
  }

  private readIndex() {
    for (const sigPart of DatFileParser.signature) {
      if (this.readUInt8() != sigPart) {
        throw new Error('Unexpected file signature');
      }
    }
    const headerSize = this.readUInt(2);
    if (headerSize !== DatFileParser.HEADER_SIZE) {
      throw new Error(`Corrupt dat file: header claims header size is ${headerSize} bytes (expected ${DatFileParser.HEADER_SIZE})`);
    }
    const entrySize = this.readUInt(2);
    if (entrySize !== DatFileParser.ENTRY_SIZE) {
      throw new Error(`Corrupt dat file: header claims entries are ${headerSize} bytes (expected ${DatFileParser.ENTRY_SIZE})`);
    }
    const entryCount = this.readUInt(4);
    if (entryCount * entrySize > this.buffer.length) {
      throw new Error('header claims entries combined are larger than the entire file');
    }
    const pathsRegionSize = this.readUInt(4);
    if (pathsRegionSize > this.buffer.length) {
      throw new Error('header claims path strings are larger than the entire file');
    }
    return this.readFiles(entryCount);
  }

  private readFiles(entryCount: number) {
    const entryList = new Array<PkgEntry | undefined>(entryCount);
    const pathOffset = entryCount * DatFileParser.ENTRY_SIZE + this.offset;
    for (let i = 0; i < entryCount; i++) {
      const entry = new PkgEntry();
      entry.innerPathHash = this.readUInt(4);

      // Top 8 bits of the path offset field were set aside to store flags.
      // 0x00FFFFFF == 0000 0000:1111 1111 1111 1111 1111 1111 (8:24 bits).
      // 1 << 24    == 0000 0001:0000 0000 0000 0000 0000 0000
      const pathOffsetAndFlags = this.readUInt(4);
      entry.innerPathOffset = (pathOffsetAndFlags & 0x00FFFFFF) + pathOffset;
      entry.dataDeflated = ((pathOffsetAndFlags & DatFileParser.PKGF_DEFLATED) != 0);

      const end = this.buffer.indexOf('\0', entry.innerPathOffset, 'ascii');
      entry.innerPath = this.buffer.toString('ascii', entry.innerPathOffset, end);

      entry.dataOffset = this.readUInt(4);
      entry.dataSize = this.readUInt(4);
      entry.unpackedSize = this.readUInt(4);
      const data = new Uint8Array(entry.dataSize);
      this.buffer.copy(data, 0, entry.dataOffset, entry.dataOffset + entry.dataSize);
      entry.data = data;
      if (entry.dataDeflated) {
        entry;
      }

      if (entry.dataOffset == 0) {
        // Null entry, dat wasn't repacked.
      } else {
        entryList[i] = entry;
      }
    }
    return entryList;
  }

  readUInt8() {
    return this.buffer.readUInt8(this.offset++);
  }

  readUInt(length: number) {
    const r = this.buffer.readUIntBE(this.offset, length);
    this.offset += length;
    return r;
  }
}

class PkgEntry {
  /** Offset to read a null-terminated string from the dat's paths blob. */
  public innerPathOffset = 0;

  /** A forward slash delimited ASCII path, with no leading slash. */
  public innerPath!: string;

  /**
   * A precalculated hash of the innerPath string.
   * @see #calculatePathHash(String)
   */
  public innerPathHash = 0;

  /** Offset to read the first byte of packed data. */
  public dataOffset = 0;

  /** Length of packed data. */
  public dataSize = 0;

  /** Expected length of data once unpacked. */
  public unpackedSize = 0;

  /** Whether the packed data is "deflate" compressed. */
  public dataDeflated = false;
  public data?: Uint8Array;
}
