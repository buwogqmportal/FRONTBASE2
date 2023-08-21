<!-- Liste oder Textblock -->
<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // lib
  import type { APIProcessActionStep, APIProcessItemData } from '$baselib/api/processaction';
  import { ArrayParser, ObjectParser, StringParser } from '$baselib/parse';

  // components
  import Select, { type SelectOption } from '$components/Form/Select.svelte';
  import Textarea from '$components/Form/Textarea.svelte';
  import type { ProcessNextFunction } from '../Process.svelte';
  import ProcessCardButtonRow from '../ProcessCardButtonRow.svelte';

  export let finished = false;
  export let data: APIProcessItemData;
  export let step: APIProcessActionStep<{ type: string }>;
  export let next: ProcessNextFunction;

  const dataParser = new ObjectParser({
    textblock: new StringParser(),
    button_1_text: new StringParser(),
    button_2_text: new StringParser(),
  });

  let pData = dataParser.toLocal(data);
  $: pData = dataParser.toLocal(data);

  const dynamicDataParser = new ArrayParser(
    new ObjectParser({
      defect_description_detail_data: new StringParser(),
    }),
  );

  let dynamicData = dynamicDataParser.toLocal(step.processitemdatadynamic);
  $: dynamicData = dynamicDataParser.toLocal(step.processitemdatadynamic);

  const CUSTOM = '__custom';

  let value = '';
  let customValue = '';
  $: options =
    dynamicData.length > 0
      ? dynamicData
          .map<SelectOption>((e) => ({
            label: e.defect_description_detail_data,
          }))
          .concat({ value: CUSTOM, label: 'Sonstiges' })
      : [];

  $: type = value === CUSTOM || options.length === 0 ? customValue : value;

  $: nextData = {
    type,
  };
</script>

<div class="space-y-4 mt-4">
  {#if finished}
    {#if pData.textblock}
      <div class="whitespace-pre-line">
        {@html pData.textblock}
      </div>
    {/if}

    {#if step.process_action_step_data?.type}
      <p class="mt-2">
        {step.process_action_step_data?.type}
      </p>
    {/if}
  {:else}
    {#if pData.textblock}
      <div class="whitespace-pre-line">
        {@html pData.textblock}
      </div>
    {/if}

    {#if options.length > 0}
      <Select placeholder={$_('processaction.process_33.type')} {options} bind:value />
    {/if}
    {#if options.length === 0 || value === CUSTOM}
      <Textarea placeholder={$_('processaction.process_33.text')} bind:value={customValue} />
    {/if}

    <ProcessCardButtonRow
      {next}
      buttons={[
        { text: pData.button_2_text, output: 'output_2', data: nextData },
        { text: pData.button_1_text, output: 'output_1', disabled: !type, data: nextData },
      ]}
    />
  {/if}
</div>
