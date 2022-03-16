import {commands, ViewColumn, window, workspace} from 'vscode';
import {Mappers} from '../ref-mappers/mappers';
import {FtlParser} from '../ftl-parser';
import {FtlFile} from '../models/ftl-file';
import {DocumentCache} from '../document-cache';

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
    const animationName = this.mappers.animationMapper.parser.getNameDef(node,
        editor.document,
        editor.selection.active);
    if (!animationName) return;
    await this.open(animationName);
  }

  public async open(animationName: string) {
    await this.ftlParser.files;
    const animation = this.mappers.animationMapper.defs.get(animationName);
    if (!animation || !animation.sheetName) return;
    const sheet = this.mappers.animationSheetMapper.defs.get(animation.sheetName);
    if (!sheet || !sheet.sheetFilePath || typeof sheet.frameWidth !== 'number' || typeof sheet.frameHeight !== 'number') return;
    const img = sheet.file.root.findMatchingImg(sheet.sheetFilePath);
    if (!img) return;
    const imgData = await workspace.fs.readFile(img.uri);
    const data = Buffer.from(imgData).toString('base64');
    const panel = window.createWebviewPanel(
        'gifRender',
        animationName + ' Animation', ViewColumn.One,
        {enableScripts: true}
    );

    panel.webview.onDidReceiveMessage((e) => {
      if (e.signal == 'ready') {
        panel.webview.postMessage({
          img: data,
          fw: sheet.frameWidth,
          fh: sheet.frameHeight,
          x: animation.x,
          y: animation.y,
          width: sheet.width,
          height: sheet.height,
          length: animation.length,
          time: animation.time,
          // debug: true
        });
      }
    });
    // language=HTML
    panel.webview.html = `
        <div class="animation-parent">
            <img id="animation">
        </div>
        <span id="debug"></span>
        <style>
            html, body {
                height: 100%;
            }

            .animation-parent {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            #animation {
                object-fit: none;
            }
        </style>
        <script>
            let imageElement = document.getElementById('animation');
            let debugText = document.getElementById('debug');
            debugText.style.display = 'none';
            let intervalId;
            let vscode = acquireVsCodeApi();
            window.addEventListener('message', e => {
                const message = e.data;
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
                imageElement.src = 'data:image/png;base64,' + message.img;
                imageElement.width = message.fw;
                imageElement.height = message.fh;
                let index = 0;
                let verticalFrameCount = message.height / message.fh;
                //this is if the time is time per frame
                let interval = message.time * 1000;
                // however interval could be time for total animation
                interval = (message.time * 1000) / message.length

                function nextFrame() {
                    let positionX = (index++ % (message.length)) * message.fw + message.x * message.fw;
                    // message.y is frames from the bottom, but we need frames from the top
                    let positionY = (verticalFrameCount - message.y - 1) * message.fh;
                    imageElement.style.objectPosition = '-' + positionX + 'px -' + positionY + 'px';
                }

                nextFrame();
                if (message.length > 1)
                    setInterval(() => nextFrame(), interval);
                if (message.debug) {
                    debugText.style.display = 'inline';
                    debugText.innerText = JSON.stringify(message, null, 4);
                }
            });
            vscode.postMessage({signal: 'ready'});
        </script>
    `;
  }
}
