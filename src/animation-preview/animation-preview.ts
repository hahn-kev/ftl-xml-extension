import {commands, ViewColumn, window, workspace} from 'vscode';
import {Mappers} from '../ref-mappers/mappers';
import {FtlParser} from '../ftl-parser';
import {FtlFile} from '../models/ftl-file';
import {DocumentCache} from '../document-cache';
import {contains} from '../helpers';
import previewHtml from '../web-views/html/index.html';
import {AnimationMessage, WeaponAnimationSheet} from './animation-message';
import {FtlOutputChannel} from '../output/ftl-output-channel';
import {URI} from 'vscode-uri';
import {FtlAnimation} from '../models/ftl-animation';
import {FtlAnimationSheet} from '../models/ftl-animation-sheet';

export class AnimationPreview {
  static readonly OpenPreviewCommand = 'ftl-xml.show-animation';

  constructor(private mappers: Mappers, private ftlParser: FtlParser, private cache: DocumentCache,
              private output: FtlOutputChannel) {
  }

  public static updateMenuContext(file: FtlFile | undefined) {
    const isAnimationFile = (file?.animationSheets.defs.length ?? 0) > 0;
    commands.executeCommand('setContext', 'isAnimationFile', isAnimationFile);
  }

  public async openFromCommand(...args: any[]) {
    const first = args[0];
    if (first instanceof Array && typeof first[0] === 'string' && typeof first[1] === 'string') {
      await this.open(first[0], first[1] as any);
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
    await this.open(animationName.name, 'anim');
  }

  getMessage(animation: FtlAnimation, sheet: FtlAnimationSheet) {
    const img = sheet.file.root.findMatchingImg(sheet.sheetFilePath!);
    if (!img) return;
    const message: AnimationMessage = {
      type: 'anim',
      img: img.uri.toString(),
      fw: sheet.frameWidth,
      fh: sheet.frameHeight,
      x: animation.x,
      y: animation.y,
      width: sheet.width,
      height: sheet.height,
      length: animation.length,
      time: animation.time
    };
    return message;
  }

  getAnimationMessage(animationName: string): AnimationMessage | undefined {
    const animation = this.mappers.animationMapper.defs.get(animationName);
    if (!animation || !animation.sheetName) return;
    const sheet = this.mappers.animationSheetMapper.defs.get(animation.sheetName);
    if (!sheet || !sheet.sheetFilePath || typeof sheet.frameWidth !== 'number' || typeof sheet.frameHeight !== 'number') return;
    return this.getMessage(animation, sheet);
  }

  getWeaponAnimationMessage(animationName: string): WeaponAnimationSheet | undefined {
    const weaponAnimation = this.mappers.weaponAnimationMapper.defs.get(animationName);
    if (!weaponAnimation?.sheetName) return;
    const sheet = this.mappers.animationSheetMapper.defs.get(weaponAnimation.sheetName);
    if (!sheet || !sheet.sheetFilePath || typeof sheet.frameWidth !== 'number' || typeof sheet.frameHeight !== 'number') return;
    const img = sheet.file.root.findMatchingImg(sheet.sheetFilePath);
    if (!img) return;
    const message = this.getMessage(weaponAnimation, sheet);
    if (!message) return;
    return {
      ...message,
      type: 'weapon',
      chargedFrame: weaponAnimation.chargedFrame,
      fireFrame: weaponAnimation.fireFrame,
      firePoint: weaponAnimation.firePoint,
      mountPoint: weaponAnimation.mountPoint
    };
  }

  public async open(animationName: string, type: 'anim' | 'weaponAnim') {
    if (type !== 'anim' && type !== 'weaponAnim') {
      this.output.appendLine(`error invalid type passed to append: ` + type);
      return;
    }
    await this.ftlParser.files;
    const message = type === 'anim'
        ? this.getAnimationMessage(animationName)
        : this.getWeaponAnimationMessage(animationName);
    if (!message) return;
    const panel = window.createWebviewPanel(
        'gifRender',
        animationName + ' Animation', ViewColumn.One,
        {enableScripts: true}
    );
    message.img = panel.webview.asWebviewUri(URI.parse(message.img)).toString();
    panel.webview.onDidReceiveMessage((e) => {
      if (e.signal == 'ready') {
        panel.webview.postMessage(message);
      }
    });
    // language=HTML
    panel.webview.html = previewHtml;
  }
}
