<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // lib
  import { cardinal } from '$baselib/formater';

  // components
  import WidgetContainer from './WidgetContainer.svelte';
  import SkeletonText from '$components/SkeletonText.svelte';

  // icons
  import UserIcon from '$icons/user.svg?component';

  export let edit = false;
  export let title = 'Widget';

  export let id = '';
  export let x = 0;
  export let y = 0;
  export let w = 1;
  export let h = 1;

  const raportID = 'dashboardclientactivecount';
</script>

<WidgetContainer link="/client" {edit} {id} {x} {y} {w} {h} {raportID} let:loading let:data on:delete>
  <svelte:fragment slot="title">
    {#if !edit}
      <UserIcon class="w-6 h-6 text-primary" />
    {/if}
  </svelte:fragment>

  {#if edit}
    <div>{title}</div>
  {:else if loading}
    <SkeletonText loadingWidth="w-10/12" />
  {:else}
    <p class="whitespace-nowrap truncate">
      {$_(`widget.count_client.${$cardinal.select(data)}`, {
        values: {
          value: data,
        },
      })}
    </p>
  {/if}
</WidgetContainer>
