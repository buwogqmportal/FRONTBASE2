<script lang="ts">
  // style
  import 'gridstack/dist/gridstack.min.css';
  import 'gridstack/dist/gridstack-extra.css';

  // node modules
  import { GridStack } from 'gridstack';

  // svelte
  import { createEventDispatcher, onMount, setContext } from 'svelte';

  const dispatch = createEventDispatcher();

  setContext('GridStack', {
    getGrid: () => grid,
  });

  let container: HTMLElement | undefined;
  export let grid: GridStack | undefined = undefined;

  export let disabled = false;
  export let float = false;
  export let layout: 'moveScale' | 'move' | 'scale' | 'none' = 'moveScale';

  $: if (disabled) {
    grid?.disable();
  } else {
    grid?.enable();
  }

  $: grid?.float(float);

  onMount(() => {
    import('gridstack/dist/h5/gridstack-dd-native');

    grid = GridStack.init(
      {
        cellHeight: '3.875rem',
        // cellHeight: '7.75rem',
        margin: '0.625rem',
        animate: false,
        disableOneColumnMode: true, // will manually do 1 column
        float,
      },
      container,
    );

    grid.on('dragstop resizestop', function () {
      dispatch('move', grid.getGridItems());
    });

    grid.on('resize', function () {
      dispatch(
        'move',
        grid.getGridItems().map((n) => n.gridstackNode),
      );
    });

    if (disabled) {
      grid.disable();
    }

    handleResize();

    return () => {
      grid.destroy(false);
    };
  });

  function handleResize() {
    let width = document.body.clientWidth;

    // tailwind defaults
    if (width < 640) {
      grid.column(1, layout);
    } else if (width < 768) {
      grid.column(2, layout);
    } else if (width < 1024) {
      grid.column(1, layout);
    } else if (width < 1280) {
      grid.column(6, layout);
    } else {
      grid.column(12, layout);
    }
  }
</script>

<svelte:window on:resize={handleResize} />

<div bind:this={container} class="grid-stack -m-2.5">
  {#if grid}
    <slot />
  {/if}
</div>
