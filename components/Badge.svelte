<script lang="ts">
  import { listToClass } from '$baselib/util';

  let class_ = '';
  export { class_ as class };

  export let type: 'text' | 'round' | 'tiny' = 'text';
  export let clickable = false;

  $: effectiveClass = [
    'inline-flex items-center justify-center text-sm font-bold rounded-full type',
    {
      text: 'px-4 py-1',
      round: 'min-w-[1.5rem] h-6 px-2',
      tiny: '',
    }[type],
    class_,
  ].reduce(listToClass);
</script>

{#if clickable}
  <button
    class="{effectiveClass} focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-2 focus-visible:ring-primary"
    on:click
  >
    <slot />
  </button>
{:else}
  <span class={effectiveClass} on:click>
    <slot />
  </span>
{/if}
