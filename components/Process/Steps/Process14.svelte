<!-- Text Eingabe -->
<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // lib
  import type { APIProcessItemData, APIProcessActionStep } from '$baselib/api/processaction';
  import { BooleanParser, ObjectParser, StringParser } from '$baselib/parse';

  // components
  import Textarea from '$components/Form/Textarea.svelte';
  import type { ProcessNextFunction } from '../Process.svelte';
  import ProcessCardButtonRow from '../ProcessCardButtonRow.svelte';

  export let finished = false;
  export let data: APIProcessItemData;
  export let step: APIProcessActionStep<{ textblock: string }>;
  export let next: ProcessNextFunction;

  const dataParser = new ObjectParser({
    textblock: new StringParser(),
    key: new StringParser('textblock'),
    input_show: new BooleanParser(),
    input_required: new BooleanParser(),
    textbox_1_text: new StringParser(),
    button_1_text: new StringParser(),
    button_2_text: new StringParser(),
    button_3_text: new StringParser(),
    button_4_text: new StringParser(),
  });

  let pData = dataParser.toLocal(data);
  $: pData = dataParser.toLocal(data);

  $: stepData = step.process_action_step_data;

  let value: string;
  $: key = pData.key;
  $: nextData = {
    [key]: value,
  };
</script>

<div class="space-y-4 mt-4">
  {#if finished}
    {#if pData.textblock}
      <div class="whitespace-pre-line">
        {pData.textblock}
      </div>
    {/if}

    {#if stepData?.[key]}
      <div class="flex flex-col gap-2">
        <div>{$_('processaction.reason')}</div>
        <div>{stepData?.[key]}</div>
      </div>
    {/if}
  {:else}
    <div class="whitespace-pre-line">
      {pData.textblock ?? ''}
      {#if pData.input_show}
        <Textarea bind:value class="mt-3" placeholder={pData.textbox_1_text} />
      {/if}
    </div>

    <ProcessCardButtonRow
      {next}
      buttons={[
        { text: pData.button_2_text, output: 'output_2', data: nextData },
        { text: pData.button_3_text, output: 'output_3', data: nextData },
        { text: pData.button_4_text, output: 'output_4', data: nextData },
        {
          text: pData.button_1_text,
          output: 'output_1',
          data: nextData,
          disabled: pData.input_show && pData.input_required && !value,
        },
      ]}
    />
  {/if}
</div>
