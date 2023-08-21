<!-- Termin vereinbaren -->
<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';
  import { DateTime } from 'luxon';

  // lib
  import type { APIProcessItemData, APIProcessActionStep } from '$baselib/api/processaction';
  import { dateFormat, dateTimeFromAPIDate, timeFormat } from '$baselib/formater';
  import { BooleanParser, ObjectParser, StringParser } from '$baselib/parse';

  // components
  import type { ProcessNextFunction } from '../Process.svelte';
  import DatePicker from '$components/Form/DatePicker.svelte';
  import ProcessCardButtonRow from '../ProcessCardButtonRow.svelte';
  import Tiles from '../Tiles.svelte';
  import Button from '$components/Form/Button.svelte';

  // icons
  import RemovableIcon from '$icons/removable.svg?component';

  export let finished = false;
  export let data: APIProcessItemData;
  export let step: APIProcessActionStep<{ textblock: string }>;
  export let next: ProcessNextFunction;

  const dataParser = new ObjectParser({
    textblock: new StringParser(),
    key: new StringParser('process_28'),
    input_required: new BooleanParser(),
    input_show: new BooleanParser(),
    input_past: new BooleanParser(),
    input_select: new BooleanParser(),
    input_select_nodata: new StringParser(),
    textbox_1_text: new StringParser(),
    button_1_text: new StringParser(),
    button_2_text: new StringParser(),
  });

  let pData = dataParser.toLocal(data);
  $: pData = dataParser.toLocal(data);

  $: key = pData.key;
  $: selectedKey = `${key}_set`;

  $: lastValue = step.process_action_step_data?.[selectedKey];
  $: lastDates = lastValue
    ? lastValue === 'NOT SET'
      ? []
      : [dateTimeFromAPIDate(lastValue)]
    : Object.values(step.process_action_step_data ?? {})
        .map((data) => dateTimeFromAPIDate(data))
        .filter(Boolean);
  let suggestedMeeting: string[] = Object.values(step.process_action_step_data ?? {});

  let dates: string[] = [''];

  $: nextData = pData.input_select
    ? {
        [selectedKey]: dates[0],
      }
    : Object.fromEntries(dates.filter(Boolean).map((date, i) => [`${key}_${i}`, date]));

  function handleDateAdd() {
    dates.push('');

    dates = dates;
  }

  function handleDateRemove(i: number) {
    return function () {
      dates.splice(i, 1);

      dates = dates;
    };
  }
</script>

<div class="space-y-4 mt-4">
  {#if finished}
    {#if pData.textblock}
      <div class="whitespace-pre-line">
        {pData.textblock}
      </div>
    {/if}

    {#if lastDates.length > 0}
      <Tiles
        data={lastDates.map((date) => ({
          title: $dateFormat.format(date.toJSDate()),
          subtitle: `${$timeFormat.format(date.toJSDate())} ${$_('processaction.clock')}`,
        }))}
        selected={() => lastValue}
        disabled
      />
    {:else if pData.input_select_nodata}
      <div>
        {pData.input_select_nodata}
      </div>
    {/if}
  {:else}
    <div class="whitespace-pre-line">
      {pData.textblock ?? ''}
    </div>

    {#if pData.input_select && suggestedMeeting.length > 0}
      <!-- TODO: sort by date -->
      <Tiles
        data={suggestedMeeting
          .map((str) => ({ str, date: dateTimeFromAPIDate(str) }))
          .map(({ str, date }) => ({
            str,
            data: { str, date },
            title: $dateFormat.format(date.toJSDate()),
            subtitle: `${$timeFormat.format(date.toJSDate())} ${$_('processaction.clock')}`,
          }))}
        selected={({ data }) => data.str === dates[0]}
        disabled={({ data }) => data.date < DateTime.now()}
        on:select={(date) => {
          dates = [date.detail['str']];
        }}
      />
    {:else if pData.input_select}
      <div>
        {pData.input_select_nodata}
      </div>
    {:else if pData.input_show}
      {#each dates as _, i}
        <div class="flex flex-row space-x-4">
          <DatePicker class="grow" disable_past={!pData.input_past} bind:value={dates[i]} />
          <Button on:click={handleDateRemove(i)} type="link" color="secondary" class="hover:text-alert">
            <RemovableIcon />
          </Button>
        </div>
      {/each}

      <Button color="ghost" on:click={handleDateAdd}>{$_('processaction.process28.date_add')}</Button>
    {/if}

    <ProcessCardButtonRow
      {next}
      buttons={[
        { text: pData.button_2_text, output: 'output_2', data: { [selectedKey]: 'NOT SET' } },
        {
          text: pData.button_1_text,
          output: 'output_1',
          data: pData.input_select
            ? {
                [`${key}_set`]: dates[0],
              }
            : nextData,
          disabled:
            ((pData.input_show && pData.input_required) || pData.input_select) && dates.filter(Boolean).length === 0,
        },
      ]}
    />
  {/if}
</div>
