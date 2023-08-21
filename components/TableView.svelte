<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // lib
  import { parseColuser, type APIColuser } from '$baselib/api/coluser';
  import type { APISearchResultHit } from '$baselib/api/search';
  import { dateFromAPIDate, formatters } from '$baselib/formater';
  import { processViewActions, type ViewAction } from '$baselib/viewAction';

  // components
  import { selectValueStore } from './Form/LocalSelect.svelte';
  import Button from './Form/Button.svelte';
  import Card from '$components/Card/Card.svelte';
  import DeadlineBadge from './DeadlineBadge.svelte';
  import Icon from './Icon.svelte';
  import Link from './Link.svelte';

  // icons
  import ArrowIcon from '$icons/arrow.svg?component';
  import { createEventDispatcher } from 'svelte';

  export let link: ((hit: Record<string, string>) => string) | false;
  export let cols: APIColuser[] = [];
  export let data: APISearchResultHit[] = [];
  export let actions: ViewAction[] = [];

  const dispatch = createEventDispatcher();

  function displayCol(col: APIColuser, data: APISearchResultHit): string {
    const formater = formatters[col.col_type];
    const value: string = data.document[col.col_class_ID];

    if (formater) {
      return formater(value);
    } else {
      return value;
    }
  }

  $: processed = cols.map(parseColuser);
</script>

<div class="overflow-x-auto">
  <Card containerClass="p-0 pt-4">
    <table class="whitespace-nowrap w-full">
      <thead class="border-b-2 border-solid border-secondary-lighter">
        <tr class="relative">
          {#each cols as row}
            <td class="font-bold pr-2 first:pl-6 last:pr-6 pb-3">
              {#if row.col_title_show === '1'}
                <div on:click={() => dispatch('sort', row.col_class_ID)} class="cursor-pointer">{row.col_title}</div>
              {/if}
            </td>
          {/each}
        </tr>
      </thead>
      <tbody>
        {#each data as data}
          <tr class="group even:bg-secondary-lighter/40 hover:text-primary transition-colors">
            {#each processed as row}
              <td class="max-w-sm pr-4 first:pl-6 last:pr-6">
                {#if link && link(data.document)}
                  <a class="block w-full h-full py-4 truncate" href={link(data.document)}>
                    {#if row.display.type === 'deadline'}
                      <div class="flex flex-row gap-2 items-center">
                        {displayCol(row, data) ?? '--'}
                        {#if dateFromAPIDate(data.document[row.col_class_ID])}
                          <DeadlineBadge date={dateFromAPIDate(data.document[row.col_class_ID])} />
                        {/if}
                      </div>
                    {:else if row.display.type === 'date'}
                      {displayCol(row, data) ?? '--'}
                    {:else if row.display.type === 'lang'}
                      {$selectValueStore(
                        row.display.info || row.col_class_ID,
                        data.document[row.col_class_ID],
                        true,
                        'value',
                      )}
                    {:else}
                      {data.document[row.col_class_ID]}
                    {/if}
                  </a>
                {:else if row.display.type === 'deadline'}
                  <div class="flex flex-row gap-2 items-center">
                    {displayCol(row, data) ?? '--'}
                    {#if dateFromAPIDate(data.document[row.col_class_ID])}
                      <DeadlineBadge date={dateFromAPIDate(data.document[row.col_class_ID])} />
                    {/if}
                  </div>
                {:else if row.display.type === 'date'}
                  {displayCol(row, data) ?? '--'}
                {:else if row.display.type === 'lang'}
                  {$selectValueStore(
                    row.display.info || row.col_class_ID,
                    data.document[row.col_class_ID],
                    true,
                    'value',
                  )}
                {:else}
                  {data.document[row.col_class_ID]}
                {/if}
              </td>
            {/each}
            <td
              class="first:pl-6 last:pl-2 last:pr-6 py-4 flex flex-row justify-end space-x-3"
              on:click|stopPropagation
            >
              {#each processViewActions( actions, data.document, (action) => ({ ...action, style: action.style === 'alert' ? 'hover:text-alert' : 'hover:text-primary' }), ) as { link, callback, style, icon }}
                {#if link}
                  <Link type="link" color="secondary" class="{style} transition-colors" href={link}
                    ><Icon iconPath={icon} /></Link
                  >
                {:else if callback}
                  <Button type="link" color="secondary" class="{style} transition-colors" on:click={callback}
                    ><Icon iconPath={icon} /></Button
                  >
                {/if}
              {/each}
              {#if link}
                <a class="text-secondary/70 group-hover:text-primary transition-colors" href={link(data.document)}>
                  <ArrowIcon class=" rotate-180" />
                </a>
              {/if}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </Card>
</div>
