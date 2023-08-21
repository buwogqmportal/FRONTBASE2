<script lang="ts">
  import { PAGINATION_PER_PAGE, type APISearchResult } from '$baselib/api/search';
  import { cardinal } from '$baselib/formater';
  import { range } from '$baselib/util';
  import { _ } from 'svelte-i18n';
  import Button from './Form/Button.svelte';

  export let searchResult: APISearchResult;
  export let per_page = PAGINATION_PER_PAGE;
  export let filterText = '';
  export let resultCountText: (cardinality: string, values: Record<string, number>) => string = undefined;
  export let hideResultCounts = false;
  export let hideFiltersActive = false;
  export let activePageIdx = 1;
  let pages = 0;
  let from = 0;
  let to = 0;

  let class_ = '';
  export { class_ as class };

  $: pages = Math.ceil(searchResult.found / per_page);
  $: from = (activePageIdx - 1) * per_page + 1;
  $: to = Math.min(activePageIdx * per_page, searchResult.found);
  $: activePageIdx = searchResult.page;

  const requestPage = (newPage: number) => {
    if (newPage !== activePageIdx) {
      activePageIdx = newPage;
    }
  };

  const handlePaginationView = (active: number, i: number) => {
    return pages <= 7 || i === 1 || i === pages || (active - 2 <= i && i <= active + 2);
  };
</script>

<div class="flex flex-col md:flex-row items-center justify-between {class_}">
  {#if pages > 1}
    <div class="flex flex-row items-center">
      {#each range(1, pages + 1) as index}
        {#if handlePaginationView(activePageIdx, index)}
          <Button
            type="link"
            color={index === activePageIdx ? 'primary' : 'secondary'}
            class="p-5 md:p-2 text-md rounded-sm font-black"
            on:click={() => requestPage(index)}>{index}</Button
          >
        {:else if handlePaginationView(activePageIdx, index - 1)}
          <span>...</span>
        {/if}
      {/each}
    </div>
  {:else}
    <div class="grow" />
  {/if}

  <p class="text-secondary/70 font-black text-center py-2">
    {#if !hideResultCounts}
      {(resultCountText
        ? resultCountText($cardinal.select(searchResult.found), {
            from: from,
            to: to,
            total: searchResult.found,
          })
        : '') ||
        $_(`components.pagination.count_${$cardinal.select(searchResult.found)}`, {
          values: {
            from: from,
            to: to,
            total: searchResult.found,
          },
        })}
    {/if}
    {#if !hideFiltersActive}
      -

      {filterText || $_(`components.pagination.filter_active`)}
    {/if}
  </p>
</div>
