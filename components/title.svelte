<script lang="ts">
  // svelte
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';
  import { goto } from '$app/navigation';

  // lib
  import { _backLink, page, Page } from '$baselib/stores';

  // icons
  import ArrowIcon from '$icons/arrow.svg?component';
  import { listToClass } from '$baselib/util';

  const titleStore: Writable<{ slim: boolean }> = getContext('_title');

  let class_ = '';
  export { class_ as class };
</script>

<div class={['c-title', $titleStore.slim && 's-slim', $_backLink && 's-backlink', class_].reduce(listToClass)}>
  {#if $_backLink}
    <button class="hidden menu:block w-6 h-6 mr-4" on:click={() => goto($_backLink)}
      ><ArrowIcon
        class="w-6 h-6 {$page === Page.Portal || $page === Page.Lieferant ? 'text-white' : 'text-primary'}"
      /></button
    >
  {/if}
  <slot />
</div>
