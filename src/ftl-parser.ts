import {Node} from 'vscode-html-languageservice';
import {FtlFile} from './models/ftl-file';
import {DocumentCache} from './document-cache';
import {FtlXmlParser, ParseContext} from './parsers/ftl-xml-parser';
import {FtlRoot} from './models/ftl-root';
import {getFileName} from './helpers';
import {FileHandled, PathRefMapperBase} from './ref-mappers/path-ref-mapper';
import {HyperspaceFile} from './models/hyperspace-file';
import {URI} from 'vscode-uri';
import {FtlTextDocument} from './models/ftl-text-document';
import {IFtlDataProvider} from './providers/ftl-data-provider';

export type FileOpener = (uri: URI) => Thenable<FtlTextDocument>;

export class FtlParser {
  constructor(private cache: DocumentCache,
              private parsers: FtlXmlParser[],
              private pathMappers: PathRefMapperBase[],
              private ftlDataProvider: IFtlDataProvider,
              private fileOpener: FileOpener) {
  }

  private _parsingPromise?: Thenable<FtlRoot>;

  public get isParsing(): boolean {
    return !!this._parsingPromise;
  }

  public get files(): Promise<Map<string, FtlFile>> {
    return this.awaitableParsing();
  }

  private async awaitableParsing() {
    if (this._parsingPromise) return this._parsingPromise.then((r) => r.xmlFiles);
    return this.root.xmlFiles;
  }

  private dataUpdated(root: FtlRoot) {
    this.ftlDataProvider.updateFtlData(root);
  }

  public readonly root = new FtlRoot();

  public async parseFiles(files: URI[], reset: boolean) {
    if (files.length == 0) return this.root;
    if (this.isParsing) return this._parsingPromise as Thenable<FtlRoot>;
    if (reset) this.root.clear();

    console.time('parse files');
    this._parsingPromise = this._parseFiles(files).then(() => this.root);
    await this._parsingPromise;
    this._parsingPromise = undefined;

    console.timeEnd('parse files');
    this.dataUpdated(this.root);
    return this.root;
  }

  public async fileAdded(file: URI) {
    await this.parseFile(file);
    this.dataUpdated(this.root);
  }

  public async fileRemoved(file: URI) {
    await this.parseFile(file, true);
    this.dataUpdated(this.root);
  }

  private async _parseFiles(files: URI[]) {
    files = [...files];

    // attempts to improve performance, seems to have worked
    const workerCount = 24;
    // this function will parse files in a loop until the files list is exhausted
    // this way we don't get stuck waiting for a single file to read, so we're always parsing
    const parseUntilFinished = async (): Promise<void> => {
      let file: URI | undefined;
      while (file = files.pop()) {
        await this.parseFile(file);
      }
    };

    const promises: Promise<void>[] = [];
    for (let i = 0; i < workerCount; i++) {
      promises.push(parseUntilFinished());
    }
    await Promise.all(promises);
  }

  private async parseFile(file: URI, fileRemoved = false) {
    const fileName = getFileName(file);
    for (const pathMapper of this.pathMappers) {
      if (pathMapper.handleFile(file, fileName, this.root, fileRemoved) == FileHandled.handled) {
        return;
      }
    }
    if (!fileName?.endsWith('.xml') && !fileName?.endsWith('.xml.append')) {
      return;
    }
    if (fileRemoved) {
      this.root.xmlFiles.delete(file.toString());
      return;
    }
    const document = await this.fileOpener(file);
    const ftlFile = this._parseDocument(document);
    this.root.xmlFiles.set(ftlFile.uri.toString(), ftlFile);
  }

  private static isHyperspaceFile(file: URI|string) {
    if (URI.isUri(file)) file = file.path;
    return file.endsWith('hyperspace.xml') || file.endsWith('hyperspace.xml.append');
  }

  public parseDocument(document: FtlTextDocument) {
    const ftlFile = this._parseDocument(document);
    this.root.xmlFiles.set(ftlFile.uri.toString(), ftlFile);
    this.dataUpdated(this.root);
    return ftlFile;
  }

  private _parseDocument(document: FtlTextDocument) {
    const ftlFile = FtlParser.isHyperspaceFile(document.uri)
        ? new HyperspaceFile(document, this.root)
        : new FtlFile(document, this.root);
    const htmlDocument = this.cache.getHtmlDocument(document);
    this.parseNodes(htmlDocument.roots, ftlFile, document);
    return ftlFile;
  }

  private parseNodes(nodes: Node[], ftlFile: FtlFile, document: FtlTextDocument) {
    for (const node of nodes) {
      const context: ParseContext = {node, file: ftlFile, document};
      for (const parser of this.parsers) {
        parser.parseNode(context);
      }
      // this.visitNode(node, document);

      this.parseNodes(node.children, ftlFile, document);
    }
  }

  private systemTags = new Set<string>();

  // noinspection JSUnusedLocalSymbols
  private visitNode(node: Node, document: FtlTextDocument) {
    if (node.tag && node.attributes && 'system' in node.attributes) {
      this.systemTags.add(node.tag);
    }
  }
}
