<script lang="ts">
  import type {
    AnimationMessage
  } from '../../animation-preview/animation-message';

  let intervalId;
  let debug = false;
  let message: AnimationMessage | undefined = undefined;
  let imagePosition: string = '';
  declare const acquireVsCodeApi: () => any;
  let vscode = acquireVsCodeApi();
  window.addEventListener('message', e => {
    message = e.data as AnimationMessage;

    if (!message) return;
    debug = message.debug;
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    let index = 0;
    let verticalFrameCount = message.height / message.fh;
    //this is if the time is time per frame
    let interval = message.time * 1000;
    // however interval could be time for total animation
    interval = (message.time * 1000) / message.length;

    function nextFrame() {
      let positionX = (index++ % (message.length)) * message.fw + message.x * message.fw;
      // message.y is frames from the bottom, but we need frames from the top
      let positionY = (verticalFrameCount - message.y - 1) * message.fh;

      imagePosition = '-' + positionX + 'px -' + positionY + 'px';
    }

    nextFrame();
    if (message.length > 1)
      setInterval(() => nextFrame(), interval);
  });
  vscode.postMessage({signal: 'ready'});
</script>

<main>
    <div class="animation-parent">
        <img id="animation"
             height={message?.fh}
             width={message?.fw}
             src={message?.img}
             style:object-position={imagePosition}>
    </div>
    {#if debug}
        <div class="grid">
            {#each Object.entries(message ?? {}) as [key, value] }
                <div>{key}</div>
                <div>{value}</div>
            {/each}
        </div>
    {/if}
</main>

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

    .grid {
        margin-top: 1rem;
        display: grid;
        grid-template-columns: 1fr 10rem;
    }

    .grid > * {
        padding: 2px;
        border: 0.125rem #006bb3 solid;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
</style>
