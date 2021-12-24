import {EventEmitter, ProgressLocation, TextDocument, Uri, window, workspace} from 'vscode';
import {Node} from 'vscode-html-languageservice';
import {FtlFile} from './models/ftl-file';
import {DocumentCache} from './document-cache';
import {FtlXmlParser, ParseContext} from './parsers/ftl-xml-parser';
import {FtlRoot} from './models/ftl-root';
import {getFileName} from './helpers';
import {FileHandled, PathRefMapperBase} from './ref-mappers/path-ref-mapper';


export class FtlParser {
  constructor(private cache: DocumentCache, private parsers: FtlXmlParser[], private pathMappers: PathRefMapperBase[]) {
  }

  private _onParsedEmitter = new EventEmitter<FtlRoot>();
  private _parsingPromise?: Thenable<FtlRoot>;

  public get isParsing(): boolean {
    return !!this._parsingPromise;
  }

  public get files() {
    if (this._parsingPromise) return this._parsingPromise.then((r) => r.files);
    return this.root.files;
  }

  public get onParsed() {
    return this._onParsedEmitter.event;
  }

  public readonly root = new FtlRoot();

  public async parseFiles(files: Uri[], reset: boolean) {
    if (files.length == 0) return this.root;
    if (this.isParsing) return this._parsingPromise as Thenable<FtlRoot>;
    if (reset) this.root.clear();

    console.time('parse files');
    this._parsingPromise = window.withProgress({
      title: 'Parsing FTL files',
      location: ProgressLocation.Window
    }, async () => {
      for (const file of files) {
        await this.parseFile(file);
      }
      return this.root;
    });
    await this._parsingPromise;
    this._parsingPromise = undefined;

    console.timeEnd('parse files');
    this._onParsedEmitter.fire(this.root);
    return this.root;
  }

  public async fileAdded(file: Uri) {
    await this.parseFile(file);
    this._onParsedEmitter.fire(this.root);
  }

  public async fileRemoved(file: Uri) {
    await this.parseFile(file, true);
    this._onParsedEmitter.fire(this.root);
  }

  private async parseFile(file: Uri, fileRemoved = false) {
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
      this.root.files.delete(file.toString());
      return;
    }
    const document = await workspace.openTextDocument(file);
    this._parseDocument(document);
  }


  public parseDocument(document: TextDocument) {
    const ftlFile = this._parseDocument(document);
    this._onParsedEmitter.fire(this.root);
    return ftlFile;
  }

  private _parseDocument(document: TextDocument) {
    const ftlFile: FtlFile = new FtlFile(document.uri, this.root);
    this.root.files.set(ftlFile.uri.toString(), ftlFile);

    const htmlDocument = this.cache.getHtmlDocument(document);
    this.parseNodes(htmlDocument.roots, ftlFile, document);
    return ftlFile;
  }

  private parseNodes(nodes: Node[], ftlFile: FtlFile, document: TextDocument) {
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
  private visitNode(node: Node, document: TextDocument) {
    if (node.tag && node.attributes && 'system' in node.attributes) {
      this.systemTags.add(node.tag);
    }
  }
}
