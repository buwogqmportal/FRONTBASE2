<script lang="ts">
  import { listToClass } from '$baselib/util';

  // node modules
  import { _ } from 'svelte-i18n';

  // components
  import Image from '../Image.svelte';

  export let image: string = undefined;

  let class_ = '';
  export { class_ as class };
  export let containerClass = 'p-6 space-y-4';
  export let noData = false;
</script>

<div class={['c-card', class_].reduce(listToClass)} on:click>
  {#if image !== undefined}
    <div class="h-48 relative">
      <Image id={image} alt="coverimage" />
      <slot name="badge" />
    </div>
  {/if}
  <div class={['c-card-container', containerClass].reduce(listToClass)}>
    {#if $$slots.title}
      <div class="flex justify-between items-center">
        <h4 class="text-xl font-black"><slot name="title" /></h4>
        <slot name="icon" />
      </div>
    {/if}

    {#if noData}
      <p class="font-bold">{$_('error.no_data_title')}</p>
      <p>{$_('error.no_data_description')}</p>
    {:else}
      <slot />
    {/if}
  </div>
</div>
