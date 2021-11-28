import {EventEmitter, ProgressLocation, TextDocument, Uri, window, workspace} from 'vscode';
import {Node} from 'vscode-html-languageservice';
import {FtlFile} from './models/ftl-file';
import {DocumentCache} from './document-cache';
import {FtlXmlParser} from './parsers/ftl-xml-parser';
import {FtlRoot} from './models/ftl-root';
import {fileName} from './helpers';
import {SoundFile} from './models/sound-file';

export class FtlParser {
  constructor(private cache: DocumentCache, private parsers: FtlXmlParser[]) {
  }

  private _onParsedEmitter = new EventEmitter<FtlRoot>();
  private _parsingPromise?: Thenable<void>;

  public get isParsing(): boolean {
    return !!this._parsingPromise;
  }

  public get files() {
    if (this._parsingPromise) return this._parsingPromise.then(() => this.root.files);
    return this.root.files;
  }

  public get onParsed() {
    return this._onParsedEmitter.event;
  }

  private root = new FtlRoot();

  public async parseCurrentWorkspace(subFolder?: string) {
    console.log('parse workspace');
    if (this.isParsing) {
      return this.files;
    }

    this.root.files.clear();
    const prefix = subFolder ? `${subFolder}/` : '';
    this._parsingPromise = workspace.findFiles(prefix + '**/*.{xml,xml.append,ogg,wav}')
        .then((files) => {
          if (files.length > 0) {
            return this.parseFiles(files);
          }
        });

    await this._parsingPromise;

    return this.root.files;
  }

  public async parseFiles(files: Uri[]) {
    if (files.length == 0) return;
    console.time('parse files');
    await window.withProgress({
      title: 'Parsing FTL files',
      location: ProgressLocation.Window
    }, async () => {
      for (const file of files) {
        await this.parseFile(file);
      }
    });
    console.timeEnd('parse files');
    this._onParsedEmitter.fire(this.root);
  }

  private async parseFile(file: Uri) {
    if (this.isAudioFile(file)) {
      const soundFile = new SoundFile(file);
      if (soundFile.type === 'wave') {
        this.root.soundWaveFiles.push(soundFile);
      } else if (soundFile.type === 'music') {
        this.root.musicFiles.push(soundFile);
      }
      return;
    }
    const document = await workspace.openTextDocument(file);
    this._parseDocument(document);
  }

  isAudioFile(file: Uri): boolean {
    const name = fileName(file);
    return (name?.endsWith('.ogg') || name?.endsWith('.wav')) ?? false;
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
