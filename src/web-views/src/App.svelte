<script lang="ts">
  import type {
    AnimationMessage, WeaponAnimationSheet
  } from '../../animation-preview/animation-message';
  import {onDestroy} from 'svelte';

  let intervalId;
  let debug = false;
  let message: AnimationMessage | undefined = undefined;
  let weapon: WeaponAnimationSheet;
  let frameNumber = 0;
  $: isWeapon = message?.type == 'weapon';
  $: imagePosition = calculateImagePosition(frameNumber, message);
  declare const acquireVsCodeApi: () => any;
  let vscode = acquireVsCodeApi();

  function calculateImagePosition(
      frameNumber: number,
      message: AnimationMessage | undefined
  ): string {
    if (!message) return '';
    let verticalFrameCount = message.height / message.fh;
    let positionX = (frameNumber % (message.length)) * message.fw + message.x * message.fw;
    // message.y is frames from the bottom, but we need frames from the top
    let positionY = (verticalFrameCount - message.y - 1) * message.fh;

    return '-' + positionX + 'px -' + positionY + 'px';
  }

  let chargeRate = 21;
  $: if (isWeapon) {
    if (firing) {
      let seconds = 1;
      interval = seconds * 1000 / (message.length - weapon.chargedFrame);
    } else {
      interval = (chargeRate * 1000) / weapon.chargedFrame;
    }
  }
  let interval: number | undefined = undefined;
  let play = true;
  $: {
    if (intervalId)
      clearInterval(intervalId);
    if (interval && play) {
      intervalId = setInterval(nextFrame, interval);
    }
  }
  onDestroy(() => {
    if (intervalId)
      clearInterval(intervalId);
  });

  function nextFrame() {
    frameNumber = (frameNumber + 1) % (message.length);
    if (isWeapon) {
      if (frameNumber == weapon.chargedFrame - 1) {
        play = false;
      }
      if (frameNumber == 0) {
        firing = false;
      }
    }
  }

  let firing = false;

  function fire() {
    frameNumber = weapon.chargedFrame;
    frameNumber++;
    play = true;
    firing = true;
  }

  function charge() {
    frameNumber = 0;
    play = true;
  }

  function start(arg: AnimationMessage) {
    if (arg.type === 'weapon') weapon = arg;
    message = arg;
    console.log('starting animation: ', arg);
    debug = message.debug;
    //this is if the time is time per frame
    // interval = message.time * 1000;
    // however interval could be time for total animation
    if (message.type === 'anim')
      interval = (message.time * 1000) / message.length;
  }

  window.addEventListener('message', e => {
    if (!e.data) return;
    start(e.data as AnimationMessage);
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
        <label>
            <input type="checkbox" bind:checked={play}>
            Enabled
        </label>
        <div>
            <button on:click={nextFrame}>Next Frame</button>
            {#if isWeapon}
                <button on:click={charge}>Charge</button>
                <button on:click={fire}>Fire</button>
            {/if}
        </div>
        <label>
            <input type="number" bind:value={chargeRate}>
            charge rate seconds
        </label>
        <label>
            frame #
            <input type="number" bind:value={frameNumber}>
        </label>
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
        display: grid;
        grid-template-columns: 1fr;
        align-items: center;
        grid-gap: 0.5rem;
        justify-items: center;
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
