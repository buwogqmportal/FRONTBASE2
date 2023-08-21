<!-- Listenauswahl -->
<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // lib
  import type { APIProcessActionStep, APIProcessItemData } from '$baselib/api/processaction';
  import { ArrayParser, BooleanParser, ObjectParser, StringParser } from '$baselib/parse';
  import { convertTo, prefixObject } from '$baselib/util';

  // components
  import type { ProcessNextFunction } from '../Process.svelte';
  import ProcessCardButtonRow from '../ProcessCardButtonRow.svelte';
  import Tiles from '../Tiles.svelte';

  export let finished = false;
  export let data: APIProcessItemData;
  export let step: APIProcessActionStep;
  export let next: ProcessNextFunction;

  const dataParser = new ObjectParser({
    textblock: new StringParser(),
    key: new StringParser('process_30'),
    input_required: new BooleanParser(),
    display_list: new BooleanParser(),
    textbox_1_text: new StringParser(),
    button_1_text: new StringParser(),
    button_2_text: new StringParser(),
    button_3_text: new StringParser(),
  });

  let pData = dataParser.toLocal(data);
  $: pData = dataParser.toLocal(data);

  const dynamicDataParser = new ArrayParser(
    new ObjectParser({
      ID: new StringParser(),
      title: new StringParser(),
      image: new StringParser(),
    }),
  );

  let dynamicData = dynamicDataParser.toLocal(step.processitemdatadynamic);
  $: dynamicData = dynamicDataParser.toLocal(step.processitemdatadynamic);

  let key = pData.key;
  $: key = pData.key;

  let selected = step.process_action_step_data?.[key] || '';

  $: selectedOption = dynamicData.find((el) => el.ID === selected);

  $: key, selectedOption;

  $: nextData = prefixObject(key, {
    '': selected,
    title: selectedOption?.title,
  });
</script>

<div class="space-y-4 mt-4">
  {#if finished}
    {#if pData.textblock}
      <div class="whitespace-pre-line">
        {@html pData.textblock}
      </div>
    {/if}

    {#if selected}
      <Tiles
        data={[{ id: selectedOption['id'], icon: selectedOption.image, subtitle: selectedOption.title }]}
        selected={() => true}
        disabled
        list={pData.display_list}
      />
    {/if}
  {:else}
    {#if pData.textblock}
      <div class="whitespace-pre-line">
        {@html pData.textblock}
      </div>
    {/if}

    <Tiles
      data={dynamicData.map((data) => ({ id: data.ID, icon: data.image, subtitle: data.title }))}
      selected={(icon) => icon.id === selected}
      list={pData.display_list}
      on:select={(ev) => {
        selected = ev.detail.id;
      }}
    />

    <ProcessCardButtonRow
      {next}
      buttons={[
        { text: pData.button_2_text, output: 'output_2', data: nextData },
        { text: pData.button_3_text, output: 'output_3' },
        { text: pData.button_1_text, output: 'output_1', data: nextData, disabled: pData.input_required && !selected },
      ]}
    />
  {/if}
</div>
