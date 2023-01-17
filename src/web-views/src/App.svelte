<script lang="ts">
  import type {
    AnimationMessage, WeaponAnimationSheet
  } from '../../animation-preview/animation-message';
  import {onDestroy} from 'svelte';
  import Corsshairs from './Corsshairs.svelte';

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

  let crosshairs: 'none' | 'firePoint' | 'mountPoint' = 'none';
  let chargeRate = 21;
  let shots = 8;
  let currentShot = 0;
  $: if (isWeapon) {
    if (firing) {
      let seconds = 0.25;
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
    if (!isWeapon) {
      return;
    }
    if (frameNumber == weapon.chargedFrame - 1) {
      play = false;
      return;
    }
    if (frameNumber == 0 && ++currentShot != shots) {
      frameNumber = weapon.chargedFrame + 1;
    } else if (frameNumber == 0) {
      firing = false;
    }
  }

  let firing = false;

  function fire() {
    currentShot = 0;
    frameNumber = weapon.chargedFrame + 1;
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
    debug = message.debug;
    if (debug) console.log('starting animation: ', arg);
    //this is if the time is time per frame
    // interval = message.time * 1000;
    // however interval could be time for total animation
    if (message.type === 'anim')
      interval = (message.time * 1000) / message.length;
  }

  function onCrosshairChanged(event: any) {
    crosshairs = event.currentTarget.value;
  }

  window.addEventListener('message', e => {
    if (!e.data) return;
    start(e.data as AnimationMessage);
  });
  vscode.postMessage({signal: 'ready'});
</script>

<main>
    {#if message}
        <div class="animation-parent">
            <div class="img-parent">
                {#if crosshairs === 'firePoint'}
                    <Corsshairs x={message.firePoint.x} y={message.firePoint.y}/>
                {/if}
                {#if crosshairs === 'mountPoint'}
                    <Corsshairs x={message.mountPoint.x} y={message.mountPoint.y}/>
                {/if}
                <img id="animation"
                     height={message?.fh}
                     width={message?.fw}
                     src={message?.img}
                     style:object-position={imagePosition}>
            </div>
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
            <div>
                <label>
                    charge rate seconds
                </label>
                <input type="number" bind:value={chargeRate} min="1">
            </div>
            <div>
                <label>
                    shots
                </label>
                <input type="number" bind:value={shots} min="1">
            </div>
            <div>
                <label>
                    frame #
                </label>
                <input type="number" bind:value={frameNumber} min="0">
            </div>
            <div>
                Crosshairs
                <label>
                    <input type="radio" checked={crosshairs === 'none'}
                           on:change={onCrosshairChanged} value="none"> none
                </label>
                <label>
                    <input type="radio" checked={crosshairs === 'firePoint'}
                           on:change={onCrosshairChanged} value="firePoint">
                    Fire point
                </label>
                <label>
                    <input type="radio" checked={crosshairs === 'mountPoint'}
                           on:change={onCrosshairChanged} value="mountPoint">
                    Mount Point
                </label>
            </div>
        </div>
    {/if}
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

    input[type="number"] {
        width: 8ch;
    }

    .img-parent {
        position: relative;
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
