<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // lib
  import { cardinal } from '$baselib/formater';

  // components
  import WidgetContainer from './WidgetContainer.svelte';
  import SkeletonText from '$components/SkeletonText.svelte';

  // icons
  import ToolsIcon from '$icons/tools.svg?component';

  export let edit = false;
  export let title = 'Widget';

  export let id = '';
  export let x = 0;
  export let y = 0;
  export let w = 1;
  export let h = 1;

  const raportID = 'dashboardfirmactivecount';
</script>

<WidgetContainer link="/firm" {edit} {id} {x} {y} {w} {h} {raportID} let:loading let:data on:delete>
  <svelte:fragment slot="title">
    {#if !edit}
      <ToolsIcon class="w-6 h-6 text-primary border-0" />
    {/if}
  </svelte:fragment>

  {#if edit}
    <div>{title}</div>
  {:else if loading}
    <SkeletonText loadingWidth="w-10/12" />
  {:else}
    <p class="whitespace-nowrap truncate">
      {$_(`widget.count_firm.${$cardinal.select(data)}`, {
        values: {
          value: data,
        },
      })}
    </p>
  {/if}
</WidgetContainer>
