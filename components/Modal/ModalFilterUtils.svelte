<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // lib
  import type { FilterValues } from '$baselib/filter';

  // components
  import Button from '$components/Form/Button.svelte';

  // icons
  import RemovableIcon from '$icons/removable.svg?component';

  export let showReset = true;
  export let filterOptions: FilterValues = {};
  let class_ = '';
  export { class_ as class };
  export let onReset: (filterOptions: FilterValues) => void;

  const resetFilter = () => {
    for (const attr in filterOptions) {
      filterOptions[attr] = [];
    }
    onReset(filterOptions);
  };
</script>

{#if showReset}
  <Button
    color="secondary"
    class={[
      'h-11 w-11 shrink-0 flex items-center justify-center rounded-lg text-secondary/70  focus:outline-none focus:ring-2 focus:ring-primary',
      class_,
    ].join(' ')}
    on:click={resetFilter}
  >
    <RemovableIcon />
  </Button>
{/if}
