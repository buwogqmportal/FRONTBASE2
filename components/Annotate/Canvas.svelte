<script lang="ts">
  // node modules
  import SignaturePad from 'signature_pad';

  // svelte
  import { createEventDispatcher } from 'svelte';

  // lib
  import { constrain, Transform } from './transform';
  import { transformable, type TransformableState } from './transformable';

  // components
  import Image from '$components/Image.svelte';

  export let imageID: string;

  export const undo = function () {
    const data = signaturePad.toData();
    const ctx = canvas.getContext('2d');
    if (data) {
      data.pop(); // remove the last dot or line

      ctx.save();

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      signaturePad.clear();

      ctx.restore();

      signaturePad.fromData(data);
      signaturePad.penColor = color;
    }
  };

  export const exportDataURI = function (): string {
    const ctx = canvas.getContext('2d');
    ctx.globalCompositeOperation = 'destination-over';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(imageEl, 0, 0);
    const dataURI = canvas.toDataURL('image/jpeg', 0.7);

    return dataURI;
  };

  const dispatch = createEventDispatcher();

  let container: HTMLElement = null;

  let width = 600;
  let height = 400;

  let imageLoaded = false;

  let canvasContainer: HTMLElement;
  let imageEl: HTMLImageElement;
  let canvas: HTMLCanvasElement;
  let usedCanvas: HTMLCanvasElement;
  let signaturePad: SignaturePad;

  export let color: string = '#00ff00';

  function initSignaturePad() {
    signaturePad = new SignaturePad(canvas, {
      usePointerEvents: false,
      penColor: color,
      dotSize: getActualSize(dotSize),
      minWidth: getActualSize(minWidth),
      maxWidth: getActualSize(maxWidth),
    });

    signaturePad.addEventListener('beginStroke', () => dispatch('beginStroke'));
    signaturePad.addEventListener('endStroke', () => dispatch('endStroke'));
    signaturePad.addEventListener('beforeUpdateStroke', () => dispatch('beforeUpdateStroke'));
    signaturePad.addEventListener('afterUpdateStroke', () => dispatch('afterUpdateStroke'));
  }

  function getActualSize(size: number): number {
    return Math.max(size, size * percentImage * Math.max(width, height));
  }

  $: if (signaturePad && canvas && canvas !== usedCanvas && imageLoaded) {
    signaturePad.off();

    initSignaturePad();

    usedCanvas = canvas;
  } else if (!signaturePad && canvas && canvas !== usedCanvas && imageLoaded) {
    initSignaturePad();

    usedCanvas = canvas;
  } else if (signaturePad && !canvas) {
    signaturePad.off();
    usedCanvas = canvas;
  }

  $: if (signaturePad) {
    signaturePad.penColor = color;
  }

  const dotSize = 2;
  const minWidth = 1;
  const maxWidth = 2;
  const percentImage = 1 / 1000;
  const scaleConstraint = { min: 0.5, max: 2 };
  const margin = 20;

  let transformableOptions: Partial<TransformableState> = {
    scale: scaleConstraint,
    onTransform: handleTransform,
    onResize: handleResize,
  };

  function resize(oldWidth: number, oldHeight: number, newWidth: number, newHeight: number): Transform {
    const widthRatio = newWidth / oldWidth;
    const heightRatio = newHeight / oldHeight;
    let scale = constrain(Math.min(widthRatio, heightRatio), scaleConstraint);

    const move: [number, number] = [newWidth / 2 - (scale * oldWidth) / 2, newHeight / 2 - (scale * oldHeight) / 2];

    return new Transform(scale, move);
  }

  function handleImageLoad(ev: CustomEvent<Event>) {
    const img = ev.detail.target as HTMLImageElement;
    width = img.naturalWidth;
    height = img.naturalHeight;

    handleResize();

    transformableOptions.transform = resize(width, height, container.clientWidth, container.clientHeight);
    imageLoaded = true;
  }

  function handleTransform(state: TransformableState) {
    canvasContainer.style.transform = `translate(${state.transform.translation[0]}px, ${state.transform.translation[1]}px) translate(-50%, -50%) scale(${state.transform.scale}) translate(50%, 50%)`;

    if (canvas && imageLoaded) {
      canvas.getContext('2d').setTransform(1 / state.transform.scale, 0, 0, 1 / state.transform.scale, 0, 0);
      signaturePad.dotSize = getActualSize(dotSize) * state.transform.scale;
      signaturePad.minWidth = getActualSize(minWidth) * state.transform.scale;
      signaturePad.maxWidth = getActualSize(maxWidth) * state.transform.scale;

      state.x = {
        min: margin - canvas.width * state.transform.scale,
        max: container.clientWidth - margin,
      };
      state.y = {
        min: margin - canvas.height * state.transform.scale,
        max: container.clientHeight - margin,
      };
    }
  }

  function handleResize() {
    const naturalScale = Math.min(container.clientWidth / width, container.clientHeight / height);

    scaleConstraint.min = naturalScale / 2;
    scaleConstraint.max = naturalScale * 2;
  }
</script>

<div class="w-full h-full select-none" bind:this={container} use:transformable={transformableOptions}>
  <div
    class="absolute bg-white shadow-md rounded"
    style="width: {width}px; height: {height}px;"
    bind:this={canvasContainer}
  >
    <Image id={imageID} class="absolute w-full h-full" bind:domElement={imageEl} on:load={handleImageLoad} />
    {#if transformableOptions}
      <canvas class="absolute w-full h-full" bind:this={canvas} {width} {height} />
    {/if}
  </div>
</div>
