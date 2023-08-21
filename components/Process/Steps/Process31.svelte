<!-- Grundriss -->
<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // svelte
  import { getContext } from 'svelte';

  // lib
  import type { APIProcessActionStep, APIProcessItemData } from '$baselib/api/processaction';
  import { APIFileViewRight, FileRequest } from '$baselib/api/file';
  import { BooleanParser, ObjectParser, StringParser } from '$baselib/parse';
  import { userHasRight } from '$baselib/stores';
  import { prefixObject } from '$baselib/util';

  // components
  import Annotate from '$components/Annotate/Annotate.svelte';
  import Button from '$components/Form/Button.svelte';
  import FileList from '../FileList.svelte';
  import Image from '$components/Image.svelte';
  import ProcessCardButtonRow from '../ProcessCardButtonRow.svelte';
  import type { ModalContext } from '$components/Modal/ModalProvider.svelte';
  import type { ProcessNextFunction } from '../Process.svelte';

  export let finished = false;
  export let data: APIProcessItemData;
  export let step: APIProcessActionStep;
  export let next: ProcessNextFunction;

  const dataParser = new ObjectParser({
    textblock: new StringParser(),
    key: new StringParser('process_31'),
    input_required: new BooleanParser(),
    input_show: new BooleanParser(),
    button_1_text: new StringParser(),
    button_2_text: new StringParser(),
    button_3_text: new StringParser(),
    button_4_text: new StringParser(),
  });

  let pData = dataParser.toLocal(data);
  $: pData = dataParser.toLocal(data);

  const dynamicDataParser = new ObjectParser({
    space_ID: new StringParser(),
  });

  let dynamicData = dynamicDataParser.toLocal(step.processitemdatadynamic);
  $: dynamicData = dynamicDataParser.toLocal(step.processitemdatadynamic);

  $: stepData = step.process_action_step_data;

  let space_ID = dynamicData?.['space_ID'] || '';
  let file_ID = '';
  let date = new Date();
  let fileTitle = step.processitemdata.file_title === '1' ? date.toUTCString() : '';
  let marked = false;

  $: if (space_ID)
    FileRequest.getFileType('space_layout', space_ID).then((file) => {
      file_ID = file[0]?.file_ID;
    });

  $: key = pData.key;

  $: nextData = prefixObject(key, {
    '': file_ID,
  });

  const { open } = getContext<ModalContext>('simple-modal');

  async function handleMarkPlan() {
    open(
      Annotate,
      {
        imageID: file_ID,
        onSave: async function (dataURI: string) {
          let files: Record<string, string>;
          if (fileTitle != '') {
            files = await FileRequest.uploadBase64(
              {
                file_view_right: APIFileViewRight.Users,
                file_title: fileTitle,
              },
              dataURI,
            );
          } else {
            files = await FileRequest.uploadBase64(
              {
                file_view_right: APIFileViewRight.Users,
              },
              dataURI,
            );
          }
          file_ID = Object.values(files)[0];
          marked = true;
        },
      },
      {
        closeButton: false,
        classWindowWrap: 'h-full',
        classWindow: 'w-full h-full m-0 bg-secondary-lighter overflow-hidden',
        classContent: 'w-full h-full',
      },
    );
  }
</script>

<div class="space-y-4 mt-4">
  {#if finished}
    {#if pData.textblock}
      <div class="whitespace-pre-line">
        {@html pData.textblock}
      </div>
    {/if}

    {#if stepData}
      <div class="flex flex-col gap-2">
        <div>{$_('processaction.map')}</div>

        <FileList files={stepData[key]} />
      </div>
    {/if}
  {:else}
    {#if pData.textblock}
      <div class="whitespace-pre-line">
        {pData.textblock}
      </div>
    {/if}

    {#if pData.input_show && pData.button_4_text && $userHasRight('processaction', 'next')}
      <Button
        color="ghost"
        on:click={() => {
          handleMarkPlan();
        }}
      >
        {pData.button_4_text}
      </Button>
    {/if}
    {#if marked}
      <a href={FileRequest.getURL(file_ID)} class="pointer-events-auto shrink-0" target="blank">
        <Image class="max-h-64 mx-auto mt-6" id={file_ID} />
      </a>
    {/if}

    <ProcessCardButtonRow
      {next}
      buttons={[
        { text: pData.button_2_text, output: 'output_2', data: nextData },
        { text: pData.button_3_text, output: 'output_3', data: nextData },
        {
          text: pData.button_1_text,
          output: 'output_1',
          data: nextData,
          disabled: pData.input_show && pData.input_required && !marked,
        },
      ]}
    />
  {/if}
</div>
