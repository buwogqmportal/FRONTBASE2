<script lang="ts">
  // svelte
  import { createEventDispatcher } from 'svelte';

  // lib
  import { FileRequest } from '$baselib/api/file';

  export let id = '';
  let class_ = 'w-full h-full object-cover';
  export { class_ as class };
  export let alt = '';
  export let href = '';
  export let domElement: HTMLImageElement = null;

  const dispatch = createEventDispatcher();

  let error = id === '';

  let loading = true;
</script>

{#if loading}
  <slot name="loading" />
{/if}

<img
  class={class_}
  hidden={$$slots.loading && loading}
  src={FileRequest.getURL(error ? 'placeholder' : id)}
  crossorigin="anonymous"
  {alt}
  {href}
  bind:this={domElement}
  on:load={(ev) => {
    loading = false;
    dispatch('load', ev);
  }}
  on:error={() => {
    if (!error) {
      error = true;
      dispatch('error');
    }
  }}
/>
