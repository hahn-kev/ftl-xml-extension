import {ViewColumn, window, workspace} from 'vscode';
import {Mappers} from '../ref-mappers/mappers';

export class AnimationPreview {
  constructor(private mappers: Mappers) {
  }

  public async open(animationName: string) {
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
          width: sheet.width,
          height: sheet.height,
          length: animation.length,
          time: animation.time
        });
      }
    });
    // language=HTML
    panel.webview.html = `
        <img id="animation">
        <style>
            #animation {
                object-fit: cover;
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
        </style>
        <script>
            let anim = document.getElementById('animation');
            let intervalId;
            let vscode = acquireVsCodeApi();
            window.addEventListener('message', e => {
                const message = e.data;
                if (intervalId) {
                    clearInterval(intervalId);
                    intervalId = null;
                }
                anim.src = 'data:image/png;base64,' + message.img;
                anim.width = message.fw;
                anim.height = message.fh;
                let index = 0;
                setInterval(() => {
                    let positionX = index++ % message.length * message.fw;
                    anim.style.objectPosition = '-' + positionX + 'px 0%';
                }, message.time * 1000);
            });
            vscode.postMessage({signal: 'ready'});
        </script>
    `;
  }
}
