<script lang="ts">
  // svelte
  import { createEventDispatcher } from 'svelte';

  import DocumentIcon from '$icons/document.svg?component';

  export let src = '';
  let class_ = 'w-full h-full object-cover';
  export { class_ as class };
  export let alt = '';
  export let domElement: HTMLImageElement = null;

  const dispatch = createEventDispatcher();

  let error = src === '';
</script>

{#if !error}
  <img
    class={class_}
    {src}
    crossorigin="anonymous"
    {alt}
    bind:this={domElement}
    on:load
    on:error={() => {
      if (!error) {
        error = true;
        dispatch('error');
      }
    }}
  />
{:else}
  <DocumentIcon class={class_} />
{/if}
