<script lang="ts">
  // node modules
  import { useQuery } from '@sveltestack/svelte-query';

  // lib
  import type { APIError } from '$baselib/api';

  // components
  import Card from './Card.svelte';

  // icons
  import ArrowIcon from '$icons/arrow.svg?component';
  import { browser } from '$app/env';

  export let key: [string, Record<string, any>] = undefined;

  export let image: string | undefined = undefined;

  let class_: string = undefined;
  export { class_ as class };
  export let containerClass = '';
  export let noData = false;
  export let hasRight = true;

  $: reportResult = useQuery<any, APIError>(key, {
    enabled: browser && Boolean(key) && hasRight,
  });
</script>

<Card class={class_} {containerClass} {image} noData={(reportResult && $reportResult.isError) || noData}>
  <svelte:fragment slot="title"><slot name="title" /></svelte:fragment>
  <svelte:fragment slot="icon">
    <slot name="icon">
      <ArrowIcon slot="icon" class="w-5 h-5 rotate-180 text-primary" />
    </slot>
  </svelte:fragment>

  <slot
    loading={reportResult && ($reportResult.isLoading || $reportResult.isIdle)}
    data={reportResult && $reportResult.data}
  />
</Card>
