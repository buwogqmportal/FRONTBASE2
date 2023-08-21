<script lang="ts" context="module">
  export type FormattedLanguageEntry = {
    language_item_root: string;
    language_item_branch: string;
    language_item_leaf: string;
    language_items: Record<string, string>;
    system: boolean;
  };

  export type FormattedLanguageClasses = {
    classes: string[];
  };
</script>

<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // components
  import Card from '$components/Card/Card.svelte';
  import { indexMulti, listToClass } from '$baselib/util';

  type T = $$Generic;

  export let data: T[];
  export let key: string | ((obj: T) => string) = '';
  export let useStretch = false;

  let class_ = '';
  export { class_ as class };

  $: grouped = Object.entries(indexMulti(data, key));
</script>

<Card
  containerClass={['h-full', class_].reduce(listToClass)}
  class={['max-h-full w-full', useStretch && 'h-full overflow-none'].reduce(listToClass)}
>
  {#if grouped.length > 0}
    {#each grouped as [name, group] (name)}
      <div>
        <slot name="title" key={name}>{name}</slot>
        {#each group as child}
          <slot {child} />
        {/each}
      </div>
    {/each}
  {:else}
    <div
      class={useStretch
        ? 'h-full flex flex-row justify-center items-center'
        : 'h-full flex flex-row justify-center items-start mt-40'}
    >
      <slot name="nodata" />
    </div>
  {/if}
</Card>
<!-- <div class="h-full">
    {#if data && data.classes.length > 0}
      <table class=" w-full">
        <tbody>
          {#each data.classes as classElem}
            <div class="w-full">
              <span>
                <td class="pr-2 py-4 font-bold">
                  {#if childKey === 'items'}
                    <span class="font-normal">{classElem.root_title + ' '}</span>
                  {/if}
                  {classElem.class_title}
                </td>
                <td class="pr-2 py-4 float-right">{classElem.class_id ? classElem.class_id : ''}</td>
              </span>
              <td class="flex flex-col w-full bg-[#fbfbfb] pl-8">
                {#each classElem[childKey] as child}
                  {#if childKey === 'rights'}
                    <GroupedTableRightItem {child} {onChange} {onEdit} {onRemove} />
                  {:else if childKey === 'items'}
                    <GroupedTableLanguageItem {child} {languages} {onRemove} {onEdit} />
                  {/if}
                {/each}
              </td>
            </div>
          {/each}
        </tbody>
      </table> -->
