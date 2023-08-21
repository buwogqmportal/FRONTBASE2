<script lang="ts">
  // node modules
  import { useQuery } from '@sveltestack/svelte-query';
  import { _ } from 'svelte-i18n';

  // svelte
  import { browser } from '$app/env';

  // lib
  import type { APIError } from '$baselib/api';
  import type { APIUser } from '$baselib/api/user';
  import { dateFromAPIDate } from '$baselib/formater';
  import { userHasRight } from '$baselib/stores';

  // components
  import DeadlineDefectRow from './_DeadlineDefectRow.svelte';
  import Loading from '$components/Loading.svelte';
  import SkeletonText from '$components/SkeletonText.svelte';
  import WidgetContainer from './WidgetContainer.svelte';
  import { convertTo } from '$baselib/util';

  $: userResult = useQuery<void, APIError, APIUser>('user/get', {
    enabled: browser && $userHasRight('user', 'get'),
  });

  export let edit = true;

  export let id = '';
  export let x = 0;
  export let y = 0;
  export let w = 1;
  export let h = 1;

  const raportID = 'dashboardcalendaritemcount';
</script>

{#if $userResult.isLoading || $userResult.isIdle}
  <Loading />
{:else}
  <WidgetContainer
    scroll
    {edit}
    {id}
    {x}
    {y}
    {w}
    {h}
    {raportID}
    raportBody={{ user_ID: $userResult.isSuccess ? $userResult.data.user_ID : '' }}
    let:loading
    let:data
    on:delete
  >
    <svelte:fragment slot="title">{$_(`widget.count_calendar_item.title`)}</svelte:fragment>
    {#if loading}
      <SkeletonText loadingWidth="w-10/12" />
    {:else}
      <div class="space-y-3 overflow-scroll">
        {#each convertTo.local.array(data.dashboardcalendaritemcount) as row}
          <DeadlineDefectRow date={dateFromAPIDate(row.start)}>{row.title}</DeadlineDefectRow>
        {/each}
      </div>
    {/if}
  </WidgetContainer>
{/if}
