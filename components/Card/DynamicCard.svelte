<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // components
  import ArrowIcon from '$icons/arrow.svg?component';
  import SettingsIcon from '$icons/settings.svg?component';

  export let icontype: 'arrow' | 'settings' = 'arrow';
  export let width: 'small' | 'full' = 'small';

  let class_ = '';
  export { class_ as class };
  export let noData = false;
</script>

<div
  class={[
    'c-card',
    class_,
    {
      small: 'w-6/12',
      full: 'w-full',
    }[width],
  ].join(' ')}
  on:click
>
  <div class="p-6">
    <div class="flex mb-4 justify-between items-center">
      <span class="text-xl text-primary"><slot name="icon" /></span>
      {#if icontype === 'settings'}
        <div class="rotate-180 text-secondary"><SettingsIcon /></div>
      {:else}
        <div class="rotate-180 text-primary"><ArrowIcon /></div>
      {/if}
    </div>

    {#if noData}
      <p class="mb-4 text-secondary/70 font-bold">{$_('error.no_data_title')}</p>
      <p class="mb-4 text-secondary/70">{$_('error.no_data_description')}</p>
    {:else}
      <slot />
    {/if}
  </div>
</div>
