<!-- Datei Upload -->
<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // svelte
  import { setContext } from 'svelte';
  import { writable } from 'svelte/store';

  // lib
  import { prefixObject } from '$baselib/util';
  import type { APIProcessItemData, APIProcessActionStep } from '$baselib/api/processaction';
  import { BooleanParser, NumberParser, ObjectParser, StringParser } from '$baselib/parse';

  // components
  import FileUpload from '$components/Form/FileUpload.svelte';
  import type { ProcessNextFunction } from '../Process.svelte';
  import ProcessCardButtonRow from '../ProcessCardButtonRow.svelte';
  import FileList from '../FileList.svelte';
  import type { FormChangedFiles } from '$components/Form.svelte';

  export let finished = false;
  export let data: APIProcessItemData;
  export let step: APIProcessActionStep<{ textblock: string; file: string[] }>;
  export let next: ProcessNextFunction;
  export let ID: string;

  const dataParser = new ObjectParser({
    textblock: new StringParser(),
    key: new StringParser('process_15'),
    upload_all: new BooleanParser(),
    upload_min_file: new NumberParser(),
    dropzone_show: new BooleanParser(),
    dropzone_text: new StringParser(),
    upload_field_text: new StringParser(),
    upload_button_text: new StringParser(),
    button_1_text: new StringParser(),
  });

  let pData = dataParser.toLocal(data);
  $: pData = dataParser.toLocal(data);

  $: stepData = step.process_action_step_data;

  $: key = pData.key;

  let files: string[] = [];

  $: nextData = prefixObject(key, {
    '': files,
  });

  const changedFiles = writable<FormChangedFiles>({});

  setContext('formchangedfiles', changedFiles);
</script>

<div class="space-y-4 mt-4">
  {#if finished}
    <div class="whitespace-pre-line">
      {pData.textblock}
    </div>

    {#if stepData}
      <div class="flex flex-col gap-2">
        <div>{$_('processaction.files')}</div>

        <FileList files={stepData[key]} />
      </div>
    {/if}
  {:else}
    <div>
      {#if pData.textblock}
        {pData.textblock}
      {/if}
    </div>

    {#if pData.dropzone_show}
      <FileUpload
        fileType={key}
        fileTypeID={ID}
        label={pData.dropzone_text}
        placeholder={pData.upload_field_text || $_('processaction.process_15.dropzone_no_files')}
        button={pData.upload_button_text || $_('processaction.process_15.dropzone_button')}
        accept={pData.upload_all ? '' : 'image/*'}
        allowAnotation
        bind:files
      />
    {/if}

    <ProcessCardButtonRow
      {next}
      buttons={[
        {
          text: pData.button_1_text,
          color: 'primary',
          callback: async () => {
            await Promise.all(Object.values($changedFiles).map((fn) => fn(ID)));

            next('output_1', nextData);
          },
          disabled: pData.dropzone_show && files.length < pData.upload_min_file,
        },
      ]}
    />
  {/if}
</div>
