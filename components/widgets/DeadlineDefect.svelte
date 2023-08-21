<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // lib
  import { dateFromAPIDate } from '$baselib/formater';

  // components
  import WidgetContainer from './WidgetContainer.svelte';
  import DeadlineDefectRow from './_DeadlineDefectRow.svelte';
  import { htmlDecode, toArray } from '$baselib/util';
  import { DateTime } from 'luxon';
  import { ObjectParser, StringParser } from '$baselib/parse';
  import { useQuery } from '@sveltestack/svelte-query';
  import type { APISearchResult } from '$baselib/api/search';

  export let edit = false;

  export let id = '';
  export let x = 0;
  export let y = 0;
  export let w = 1;
  export let h = 1;

  const raportID = 'dashboarddefectdeadlineshortraport';

  const resultConverter = new ObjectParser({
    future: new StringParser(''),
    today: new StringParser(''),
    past: new StringParser(''),
    url: new StringParser(''),
  });

  $: reportResult = useQuery(
    [`raport/getdata/${raportID}`, { timestamp: DateTime.now().startOf('day').toSeconds().toString() }],
    {
      select: (data) => {
        const res = resultConverter.toLocal(data);

        return {
          past: (parse(res.past) ?? { found: 0 }) as APISearchResult,
          today: (parse(res.today) ?? { found: 0 }) as APISearchResult,
          future: (parse(res.future) ?? { found: 0 }) as APISearchResult,
          url: res.url,
        };
      },
    },
  );

  $: hasData = $reportResult.isSuccess && Object($reportResult.data);

  function parse(data: string) {
    if (!data) return;

    data = htmlDecode(data).replaceAll('\n', '\\n');
    try {
      return JSON.parse(data);
    } catch {
      console.error('Failed parsing string', data);
    }
  }
</script>

<WidgetContainer link={hasData && htmlDecode($reportResult.data.url)} scroll {edit} {id} {x} {y} {w} {h} on:delete>
  <svelte:fragment slot="title">{$_('widget.deadline_defect.title')}</svelte:fragment>

  <p>{$_('widget.deadline_defect.description')}</p>

  {#if hasData}
    {@const parsed = $reportResult.data}
    {#if parsed && (parsed.past.found >= 0 || parsed.today.found >= 0 || parsed.future.found >= 0)}
      <div>
        {#each toArray(parsed.past.hits) as row}
          <a href="/defect/details/{row.document.defect_ID}" class="block py-1.5">
            <DeadlineDefectRow date={dateFromAPIDate(row.document.defect_deadline)}
              >{row.document.defect_title}</DeadlineDefectRow
            >
          </a>
        {/each}

        <hr class="my-1 border-secondary-lighter" />

        {#if parsed.today.found > 0}
          <a href="/defect/details/{parsed.today.hits[0].document.defect_ID}" class="block py-1.5">
            <DeadlineDefectRow date={dateFromAPIDate(parsed.today.hits[0].document.defect_deadline)}>
              {parsed.today.hits[0].document.defect_deadline}
            </DeadlineDefectRow>
          </a>

          <hr class="my-1 border-secondary-lighter" />
        {/if}

        {#each toArray(parsed.future.hits) as row}
          <a href="/defect/details/{row.document.defect_ID}" class="block py-1.5">
            <DeadlineDefectRow date={dateFromAPIDate(row.document.defect_deadline)}
              >{row.document.defect_title}</DeadlineDefectRow
            >
          </a>
        {/each}
      </div>
    {:else}
      <p>{$_('widget.deadline_defect.nodata')}</p>
    {/if}
  {:else}
    <DeadlineDefectRow loading loadingWidth="w-8/12" />
    <DeadlineDefectRow loading loadingWidth="w-10/12" />
    <hr class="my-2 border-secondary-lighter" />
    <DeadlineDefectRow loading loadingWidth="w-9/12" />
    <hr class="my-2 border-secondary-lighter" />
    <DeadlineDefectRow loading loadingWidth="w-7/12" />
    <DeadlineDefectRow loading loadingWidth="w-8/12" />
  {/if}
</WidgetContainer>
