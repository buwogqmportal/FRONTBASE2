<script lang="ts">
  // node modules
  import { useQuery } from '@sveltestack/svelte-query';

  // svelte
  import { browser } from '$app/env';

  // lib
  import { userHasRight } from '$baselib/stores';
  import type { APIError } from '$baselib/api';

  // components
  import DynamicCard from './DynamicCard.svelte';

  export let icontype: 'arrow' | 'settings' = 'arrow';
  export let width: 'small' | 'full' = 'small';
  export let raportIDs: string[] = [];

  $: reportResult = useQuery<any, APIError>(
    [
      'raport/getmultidata',
      {
        raport_IDs: raportIDs,
      },
    ],
    {
      enabled: browser && $userHasRight('raport', 'getmultidata'),
    },
  );
</script>

<DynamicCard {icontype} {width} noData={$reportResult.isError || (browser && $reportResult.isIdle)}>
  <svelte:fragment slot="title"><slot name="title" /></svelte:fragment>
  <div slot="icon" class="text-primary">
    <slot name="icon" />
  </div>

  <slot loading={$reportResult.isLoading || $reportResult.isIdle} data={$reportResult.data} />
</DynamicCard>
