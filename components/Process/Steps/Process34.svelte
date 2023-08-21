<!-- Defect Infomationen hinzufuegen -->
<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';
  import { useQuery } from '@sveltestack/svelte-query';

  // svelte
  import { browser } from '$app/env';

  // lib
  import type { APIError } from '$baselib/api';
  import type { APIDefect } from '$baselib/api/defect';
  import type { APIProcessItemData, APIProcessActionStep } from '$baselib/api/processaction';
  import { BooleanParser, ObjectParser, StringParser } from '$baselib/parse';
  import { userHasRight } from '$baselib/stores';

  // components
  import Textarea from '$components/Form/Textarea.svelte';
  import type { ProcessNextFunction } from '../Process.svelte';
  import Form from '$components/Form.svelte';
  import Process34Form from './_Process34Form.svelte';
  import ProcessCardButtonRow from '../ProcessCardButtonRow.svelte';

  export let finished = false;
  export let data: APIProcessItemData;
  export let step: APIProcessActionStep<{ textblock: string }>;
  export let next: ProcessNextFunction;

  const dataParser = new ObjectParser({
    textblock: new StringParser(),
    key: new StringParser('textblock'),
    input_show: new BooleanParser(),
    textbox_1_text: new StringParser(),
    category: new BooleanParser(),
    client_status: new BooleanParser(),
    deadline: new BooleanParser(),
    description: new BooleanParser(),
    description_ID: new BooleanParser(),
    firm: new BooleanParser(),
    priority: new BooleanParser(),
    update_title: new BooleanParser(),
    trade: new BooleanParser(),
    process_prevent: new BooleanParser(),
    button_1_text: new StringParser(),
    button_2_text: new StringParser(),
  });

  let pData = dataParser.toLocal(data);
  $: pData = dataParser.toLocal(data);

  const dynamicDataParser = new ObjectParser({
    project_ID: new StringParser(),
    defect_ID: new StringParser(),
  });

  let dynamicData = dynamicDataParser.toLocal(step.processitemdatadynamic);
  $: dynamicData = dynamicDataParser.toLocal(step.processitemdatadynamic);

  $: stepData = step.process_action_step_data;

  let form: HTMLFormElement;
  $: project_ID = dynamicData?.project_ID ?? '';
  $: defect_ID = dynamicData?.defect_ID ?? '';

  let category = '';
  let client_status = '';
  let deadline = '';
  let description = '';
  let description_ID = '';
  let firm = '';
  let priority = '';
  let trade = '';
  let title = '';

  $: defectResult = useQuery<APIDefect, APIError>(
    [
      `defect/get`,
      {
        defect_ID,
        defect_data_type_priority: '2',
      },
    ],
    {
      enabled: browser && $userHasRight('defect', 'get') && Boolean(defect_ID),
      onSuccess(data) {
        category = category || data.defect_data.defect_category;
        client_status = client_status || data.defect_data.defect_client_status;
        deadline = deadline || data.defect_data.defect_deadline;
        description = description || data.defect_description;
        description_ID = description_ID || data.defect_data.defect_description_ID;
        firm = firm || data.firm_ID;
        priority = priority || data.defect_data.defect_priority;
        trade = trade || data.defect_data.trade_ID;
        title = title || data.defect_title;
      },
    },
  );

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
        <Textarea bind:value placeholder={pData.textbox_1_text} />
      {/if}
    </div>

    {#if $defectResult.isSuccess}
      <Form action="defect/update" options={{ defect_ID: defect_ID, process_prevent: pData.process_prevent }} bind:form>
        <Process34Form
          project={project_ID}
          show_category={pData.category}
          bind:category
          show_client_status={pData.client_status}
          bind:client_status
          show_deadline={pData.deadline}
          bind:deadline
          show_description={pData.description}
          bind:description
          show_description_ID={pData.description_ID}
          bind:description_ID
          show_firm={pData.firm}
          bind:firm
          show_priority={pData.priority}
          bind:priority
          show_trade={pData.trade}
          bind:trade
          show_title={pData.update_title}
          bind:title
        />
      </Form>
    {/if}
    <ProcessCardButtonRow
      {next}
      buttons={[
        { text: pData.button_2_text, output: 'output_2', data: nextData },
        {
          text: pData.button_1_text,
          output: 'output_1',
          data: nextData,
          disabled: Boolean(
            (pData.category && !category) ||
              (pData.client_status && !client_status) ||
              (pData.deadline && !deadline) ||
              (pData.description && !description) ||
              (pData.description_ID && !description_ID) ||
              (pData.firm && !firm) ||
              (pData.priority && !priority) ||
              (pData.trade && !trade) ||
              (pData.update_title && !title),
          ),
          callback: () => {
            const event = new window.SubmitEvent('submit', {
              submitter: this,
            });

            form.dispatchEvent(event);
            next('output_1');
          },
        },
      ]}
    />
  {/if}
</div>
