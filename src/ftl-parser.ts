import {EventEmitter, ProgressLocation, TextDocument, Uri, window, workspace} from 'vscode';
import {Node} from 'vscode-html-languageservice';
import {FtlFile} from './models/ftl-file';
import {DocumentCache} from './document-cache';
import {FtlXmlParser} from './parsers/ftl-xml-parser';

export class FtlParser {
  constructor(private cache: DocumentCache, private parsers: FtlXmlParser[]) {
  }

  private _onFileParsedEmitter = new EventEmitter<{ files: Map<string, FtlFile> }>();
  private _parsingPromise?: Thenable<void>;

  public get isParsing(): boolean {
    return !!this._parsingPromise;
  }

  public get files() {
    if (this._parsingPromise) return this._parsingPromise.then(() => this._files);
    return this._files;
  }

  public get onFileParsed() {
    return this._onFileParsedEmitter.event;
  }

  private _files = new Map<string, FtlFile>();

  public async parseCurrentWorkspace(subFolder?: string) {
    console.log('parse workspace');
    if (this.isParsing) {
      return this.files;
    }

    this._files.clear();
    const prefix = subFolder ? `${subFolder}/` : '';
    this._parsingPromise = workspace.findFiles(prefix + '**/*.{xml,xml.append}')
        .then((files) => {
          if (files.length > 0) {
            return this.parseFiles(files);
          }
        });

    await this._parsingPromise;

    return this._files;
  }

  public async parseFiles(files: Uri[]) {
    if (files.length == 0) return;
    console.time('parse files');
    await window.withProgress({
      title: 'Parsing FTL files',
      location: ProgressLocation.Window
    }, async () => {
      for (const file of files) {
        const document = await workspace.openTextDocument(file);
        this._parseFile(document);
      }
    });
    console.timeEnd('parse files');
    this._onFileParsedEmitter.fire({files: this._files});
  }

  public parseFile(document: TextDocument) {
    this._parseFile(document);
    this._onFileParsedEmitter.fire({files: this._files});
  }

  private _parseFile(document: TextDocument) {
    const ftlFile: FtlFile = new FtlFile(document.uri);
    this._files.set(ftlFile.uri.toString(), ftlFile);

    const htmlDocument = this.cache.getHtmlDocument(document);
    this.parseNodes(htmlDocument.roots, ftlFile, document);
  }

  private parseNodes(nodes: Node[], ftlFile: FtlFile, document: TextDocument) {
    for (const node of nodes) {
      for (const parser of this.parsers) {
        parser.parseNode(node, ftlFile, document);
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
