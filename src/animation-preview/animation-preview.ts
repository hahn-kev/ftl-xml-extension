import {commands, ViewColumn, window, workspace} from 'vscode';
import {Mappers} from '../ref-mappers/mappers';
import {FtlParser} from '../ftl-parser';
import {FtlFile} from '../models/ftl-file';
import {DocumentCache} from '../document-cache';
import {contains} from '../helpers';
import previewHtml from '../web-views/html/index.html';
import {AnimationMessage} from './animation-message';
import {FtlOutputChannel} from '../output/ftl-output-channel';

export class AnimationPreview {
  static readonly OpenPreviewCommand = 'ftl-xml.show-animation';

  constructor(private mappers: Mappers, private ftlParser: FtlParser, private cache: DocumentCache) {
  }

  public static updateMenuContext(file: FtlFile | undefined) {
    const isAnimationFile = (file?.animationSheets.defs.length ?? 0) > 0;
    commands.executeCommand('setContext', 'isAnimationFile', isAnimationFile);
  }

  public async openFromCommand(...args: any[]) {
    const first = args[0];
    if (first instanceof Array && typeof first[0] === 'string') {
      await this.open(first[0]);
      return;
    }
    await this.openForActiveEditor();
  }

  public async openForActiveEditor() {
    const editor = window.activeTextEditor;
    if (!editor) return;
    const htmlDocument = this.cache.getHtmlDocument(editor.document);
    const node = htmlDocument.findNodeAt(editor.document.offsetAt(editor.selection.active));

    const animationName = this.mappers.animationMapper.parser.getNameDef({
      node,
      document: editor.document
    });
    if (!animationName || !contains(animationName.range, editor.selection.active)) return;
    await this.open(animationName.name);
  }

  public async open(animationName: string) {
    await this.ftlParser.files;
    const animation = this.mappers.animationMapper.defs.get(animationName);
    if (!animation || !animation.sheetName) return;
    const sheet = this.mappers.animationSheetMapper.defs.get(animation.sheetName);
    if (!sheet || !sheet.sheetFilePath || typeof sheet.frameWidth !== 'number' || typeof sheet.frameHeight !== 'number') return;
    const img = sheet.file.root.findMatchingImg(sheet.sheetFilePath);
    if (!img) return;

    const panel = window.createWebviewPanel(
        'gifRender',
        animationName + ' Animation', ViewColumn.One,
        {enableScripts: true}
    );
    const message: AnimationMessage = {
      img: panel.webview.asWebviewUri(img.uri).toString(),
      fw: sheet.frameWidth,
      fh: sheet.frameHeight,
      x: animation.x,
      y: animation.y,
      width: sheet.width,
      height: sheet.height,
      length: animation.length,
      time: animation.time,
      // debug: true
    };
    panel.webview.onDidReceiveMessage((e) => {
      if (e.signal == 'ready') {

        panel.webview.postMessage(message);
      }
    });
    // language=HTML
    panel.webview.html = previewHtml;
  }
}
