<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // components
  import WidgetContainer from './WidgetContainer.svelte';

  // icons
  import ToolsIcon from '$icons/tools.svg?component';
  import RemoveableIcon from '$icons/removable.svg?component';

  export let edit = false;
  export let title = 'Widget';

  export let id = '';
  export let x = 0;
  export let y = 0;
  export let w = 1;
  export let h = 1;
</script>

<WidgetContainer class="bg-primary text-white border-0" link="/defect/set" {edit} {id} {x} {y} {w} {h} on:delete>
  <svelte:fragment slot="title">
    {#if !edit}
      <ToolsIcon class="w-6 h-6" />
    {/if}
  </svelte:fragment>
  <RemoveableIcon slot="icon" class="rotate-45 w-5 h-5 " />

  {#if edit}
    <div>{title}</div>
  {:else}
    <p class="whitespace-nowrap truncate">{$_(`widget.set_defect`)}</p>
  {/if}
</WidgetContainer>
