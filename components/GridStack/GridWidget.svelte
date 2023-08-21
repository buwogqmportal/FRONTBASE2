<script lang="ts">
  // node modules
  import type { GridStack } from 'gridstack';

  // svelte
  import { getContext, onMount } from 'svelte';

  // lib
  const { getGrid } = getContext<{ getGrid: () => GridStack }>('GridStack');
  const grid = getGrid();

  let container: HTMLElement | undefined;

  export let id = '';
  export let x = 0;
  export let y = 0;
  export let w = 1;
  export let minW: number = undefined;
  export let maxW: number = undefined;
  export let h = 1;
  export let minH: number = undefined;
  export let maxH: number = undefined;
  export let locked = false;
  export let noResize = false;
  export let noMove = false;

  onMount(() => {
    grid.makeWidget(container);

    return () => {
      grid.removeWidget(container, false, false);
    };
  });
</script>

<div
  bind:this={container}
  data-id={id}
  gs-x={x}
  gs-y={y}
  gs-w={w}
  gs-min-w={minW}
  gs-max-w={maxW}
  gs-h={h}
  gs-min-h={minH}
  gs-max-h={maxH}
  gs-locked={locked}
  gs-no-resize={noResize}
  gs-no-move={noMove}
>
  <div class="grid-stack-item-content" style="overflow: visible">
    <slot />
  </div>
</div>
