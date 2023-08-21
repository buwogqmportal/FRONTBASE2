<script lang="ts" context="module">
  export type FilterCriteria = {
    type: string;
    title: string;
    field_name: string;
    options: SelectOption[];
  };

  export function getFilterCriteria(colFilterResult: APIColuser[], searchResult: APISearchResult): FilterCriteria[] {
    const facetsIdx = indexSingle(searchResult.facet_counts, 'field_name');
    return colFilterResult.map(parseColuser).map((col) => ({
      type: col.col_type_filter,
      title: col.col_title,
      field_name: col.col_class_ID,
      options:
        facetsIdx[col.col_class_ID]?.counts.map((count) => ({
          value: count.value,
          label:
            col.display.type === 'lang'
              ? get(selectValueStore)(col.display.info ?? col.col_class_ID, count.value, false, 'value')
              : count.value,
        })) ?? [],
    }));
  }
</script>

<script lang="ts">
  import DateRange from '$components/Form/DateRange.svelte';
  import MultiSelect from '$components/Form/MultiSelect.svelte';
  import ModalButtonRow from './ModalButtonRow.svelte';
  import ModalFilterUtils from './ModalFilterUtils.svelte';
  import { _ } from 'svelte-i18n';
  import type { SelectOption } from '$components/Form/Select.svelte';
  import type { FilterValues } from '$baselib/filter';
  import type { APISearchResult } from '$baselib/api/search';
  import { indexSingle } from '$baselib/util';
  import { parseColuser, type APIColuser } from '$baselib/api/coluser';
  import { get } from 'svelte/store';
  import { selectValueStore } from '$components/Form/LocalSelect.svelte';

  export let successBtnText = $_('modal.save');
  export let onSuccess: (value: FilterValues) => void;

  export let filterCriteria: FilterCriteria[] = [];
  export let filterCriteriaMobile: FilterCriteria[] = null;
  export let filterValues: FilterValues = {};

  function reset() {
    for (const attr in filterValues) {
      filterValues[attr] = [];
    }

    filterCriteria = filterCriteria;
    filterValues = filterValues;
  }
</script>

<div class="h-full {Array.isArray(filterCriteriaMobile) ? 'hidden md:flex' : 'flex'} flex-col justify-between">
  <div class="flex-grow">
    {#each filterCriteria as item}
      {#if item.type === 'multiselect'}
        <MultiSelect
          class="mb-6"
          label={item.title}
          placeholder={$_('components.multiselect.option_placeholder')}
          name={item.field_name}
          options={item.options}
          bind:value={filterValues[item.field_name]}
          on:change={() => {
            filterValues = filterValues;
          }}
        />
      {:else if item.type === 'date'}
        <DateRange
          class="mb-6"
          label={item.title}
          bind:value={filterValues[item.field_name]}
          on:change={() => {
            filterValues = filterValues;
          }}
        />
      {/if}
    {/each}
  </div>
  <div class="flex flex-row justify-between items-center space-x-4 mt-6">
    <ModalFilterUtils onReset={reset} />
    <ModalButtonRow class="grow" {successBtnText} on:success={() => onSuccess(filterValues)} />
  </div>
</div>
{#if Array.isArray(filterCriteriaMobile)}
  <div class="h-full flex md:hidden flex-col justify-between">
    <div class="flex-grow">
      {#each filterCriteriaMobile as item}
        {#if item.type === 'multiselect'}
          <MultiSelect
            class="mb-6"
            label={item.title}
            placeholder={$_('defect.overview.filter_select_placeholder')}
            options={item.options}
            bind:value={filterValues[item.field_name]}
            on:change={() => {
              filterValues = filterValues;
            }}
          />
        {:else if item.type === 'date'}
          <DateRange
            class="mb-6"
            label={item.title}
            bind:value={filterValues[item.field_name]}
            on:change={() => {
              filterValues = filterValues;
            }}
          />
        {/if}
      {/each}
    </div>
    <div class="flex flex-row justify-between items-center space-x-4 mt-6">
      <ModalFilterUtils onReset={reset} />
      <ModalButtonRow class="grow" {successBtnText} on:success={() => onSuccess(filterValues)} />
    </div>
  </div>
{/if}
