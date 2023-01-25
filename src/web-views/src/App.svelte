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
  let currentShot = 0;
  $: if (isWeapon) {
    if (firing) {
      let seconds = 0.25;
      interval = seconds * 1000 / (message.length - weapon.chargedFrame);
    } else {
      interval = (weapon.cooldown * 1000) / weapon.chargedFrame;
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
    if (frameNumber == weapon.chargedFrame) {
      chargeFinished();
      return;
    }
    if (frameNumber == 0 && ++currentShot != weapon.shots) {
      frameNumber = weapon.chargedFrame + 1;
    } else if (frameNumber == 0) {
      firingFinished();
    }
  }

  let firing = false;

  function fire() {
    currentShot = 0;
    chargeImagePercent = 0;
    frameNumber = weapon.chargedFrame + 1;
    play = true;
    firing = true;
  }

  function firingFinished() {
    firing = false;
    chargeImagePercent = 0;
  }

  function chargeFinished() {
    chargeImagePercent = 0;
    play = false;
  }

  function charge() {
    chargeImagePercent = 0;
    frameNumber = 0;
    play = true;
  }

  let percentInterval;
  //percent 0 - 1
  let chargeImagePercent = 0;
  const msPerChargeFrame = 1000 / 60;
  $: if (isWeapon) {
    if (percentInterval)
      clearInterval(percentInterval);
    if (play && !firing) {
      percentInterval = setInterval(increasePercent, msPerChargeFrame);
    }
  }

  function increasePercent() {
    let totalMs = weapon.cooldown * 1000;
    chargeImagePercent += msPerChargeFrame / totalMs;
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

  let zoom = 1;

  function onZoomChanged(event: any) {
    zoom = parseInt(event.currentTarget.value);
  }

  window.addEventListener('message', e => {
    if (!e.data) return;
    start(e.data as AnimationMessage);
  });
  vscode.postMessage({signal: 'ready'});
</script>

<main>
    {#if message}
        <div class="animation-parent"  style="--zoom: {zoom}; --height: {message?.fh}px">
            <div class="img-parent span-two">
                {#if crosshairs === 'firePoint'}
                    <Corsshairs x={message.firePoint.x}
                                y={message.firePoint.y}/>
                {/if}
                {#if crosshairs === 'mountPoint'}
                    <Corsshairs x={message.mountPoint.x}
                                y={message.mountPoint.y}/>
                {/if}
                <img id="animation"
                     height={message?.fh}
                     width={message?.fw}
                     src={message?.img}
                     style:object-position={imagePosition}>
                {#if weapon?.chargeImage}
                    <img class="charge-image"
                         height={message?.fh}
                         width={message?.fw}
                         src={message?.chargeImage}
                         style="--percent: {chargeImagePercent}">
                {/if}
            </div>
            <label class="span-two">
                <input type="checkbox" bind:checked={play}>
                Enabled
            </label>
            <div class="span-two">
                <progress value={chargeImagePercent}/>
            </div>
            <div class="span-two">
                <button on:click={nextFrame}>Next Frame</button>
                {#if isWeapon}
                    <button on:click={charge}>Charge</button>
                    <button on:click={fire}>Fire</button>
                {/if}
            </div>
            <label>
                cooldown seconds
            </label>
            <input type="number" bind:value={message.cooldown} min="1">
            <label>
                shots
            </label>
            <input type="number" bind:value={message.shots} min="1">
            <label>
                frame #
            </label>
            <input type="number" bind:value={frameNumber} min="0">
            <div class="span-two">
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
            <div class="span-two">
                Zoom
                <label>
                    <input type="radio" checked={zoom === 1}
                           on:change={onZoomChanged} value="1"> None
                </label>
                <label>
                    <input type="radio" checked={zoom === 2}
                           on:change={onZoomChanged} value="2">
                    200%
                </label>
                <label>
                    <input type="radio" checked={zoom === 3}
                           on:change={onZoomChanged} value="3">
                    300%
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
        padding: 0;
        transform: scale(var(--zoom));
        transform-origin: bottom;
        align-self: end;
    }

    .animation-parent {
        width: 100%;
        height: 100%;
        display: grid;
        grid-template-columns: auto auto;
        grid-template-rows: calc(var(--height) * 3) auto;
        align-items: center;
        grid-gap: 0.5rem;
        justify-items: center;
        justify-content: center;
    }

    #animation {
        object-fit: none;
        image-rendering: pixelated; 
    }

    .charge-image {
        image-rendering: pixelated; 
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        opacity: calc(var(--percent));
    }

    .clip-charge {
        clip-path: inset(calc(100% - var(--percent) * 100%) 0 0 0);
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

    .span-two {
        grid-column: span 2;
    }
</style>
