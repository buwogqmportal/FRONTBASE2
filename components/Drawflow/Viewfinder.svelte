<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { type DrawflowNodeProxy, getProcessBoundTransform, renderProcess } from './util';

  let class_ = '';
  export { class_ as class };

  export let process: Record<string, DrawflowNodeProxy>;
  export let view: { x: number; y: number; width: number; height: number };

  const dispatch = createEventDispatcher();

  let width: number;
  let height: number;

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  onMount(() => {
    requestAnimationFrame(() => {
      ctx = canvas.getContext('2d');
    });
  });

  function handleMove(e: MouseEvent) {
    if (e.buttons > 0) {
      const [x, y, scale] = getProcessBoundTransform(
        process,
        width * window?.devicePixelRatio,
        height * window?.devicePixelRatio,
      );
      dispatch('moveView', [-(e.offsetX + x) / scale, -(e.offsetY + y) / scale]);
    }
  }

  $: if (ctx && process && view) {
    requestAnimationFrame(() => renderProcess(ctx, process, view));
  }
</script>

<canvas
  bind:this={canvas}
  width={width * window?.devicePixelRatio}
  height={height * window?.devicePixelRatio}
  bind:clientWidth={width}
  bind:clientHeight={height}
  class={class_}
  on:mousemove={handleMove}
/>
