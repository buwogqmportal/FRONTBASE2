<!-- Unterschrift -->
<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // svelte
  import { getContext } from 'svelte/internal';

  // lib
  import { APIFileViewRight, FileRequest } from '$baselib/api/file';
  import type { APIProcessActionStep, APIProcessItemData } from '$baselib/api/processaction';
  import { ArrayParser, BooleanParser, ObjectParser, StringParser } from '$baselib/parse';

  // components
  import Button from '$components/Form/Button.svelte';
  import ImageExtern from '$components/ImageExtern.svelte';
  import ModalPdfViewer from '$components/Modal/ModalPDFViewer.svelte';
  import type { ModalContext } from '$components/Modal/ModalProvider.svelte';
  import type { ProcessNextFunction } from '../Process.svelte';

  // icons
  import CheckIcon from '$icons/checkmark.svg?component';
  import ProcessCardButtonRow from '../ProcessCardButtonRow.svelte';

  export let finished = false;
  export let data: APIProcessItemData;
  export let step: APIProcessActionStep;
  export let next: ProcessNextFunction;

  const dataParser = new ObjectParser({
    textblock: new StringParser(),
    prefix: new StringParser(),
    signature_show: new BooleanParser(),
    file_title: new StringParser(),
    button_1_text: new StringParser(),
    button_2_text: new StringParser(),
  });

  let pData = dataParser.toLocal(data);
  $: pData = dataParser.toLocal(data);

  const dynamicDataParser = new ArrayParser(
    new ObjectParser({
      file_ID: new StringParser(),
      file_title: new StringParser(),
      user_personal_prename: new StringParser(),
      user_personal_lastname: new StringParser(),
    }),
  );

  let dynamicData = dynamicDataParser.toLocal(step.processitemdatadynamic);
  $: dynamicData = dynamicDataParser.toLocal(step.processitemdatadynamic);

  let isDocumentSigned: Record<string, boolean> = {};
  $: isDocumentSigned = Object.fromEntries(
    dynamicData.map((file) => [file.file_ID, isDocumentSigned[file.file_ID] ?? false]),
  );
  $: isEveryDocumentSigned = Object.values(isDocumentSigned).every((clicked) => clicked);

  async function saveSignature(url: string) {
    const response = await FileRequest.uploadBase64(
      {
        file_type_ID: step.process_action_ID,
        file_type: pData.prefix,
        file_view_right: APIFileViewRight.Everyone,
      },
      url,
    );

    if (response) {
      return Object.values(response)[0] || undefined;
    }

    return undefined;
  }

  /* Modal Utility */
  const { open, close } = getContext<ModalContext>('simple-modal');

  function openPDF(url: string, prename: string, lastname: string) {
    open(
      ModalPdfViewer,
      {
        enableSigning: pData.signature_show,
        url: url,
        onSave: async (singature: string) => {
          close();
          await saveSignature(singature);
          isDocumentSigned[url] = true;
        },
        prename,
        lastname,
      },
      {
        title: $_('modal.pdf_viewer.title'),
        secondaryStyle: true,
        classWindowWrap: 'h-full',
        classWindow: 'w-full h-full m-0 overflow-hidden',
        classContent: 'w-full h-full p-0',
      },
    );
  }
</script>

<div class="space-y-4 mt-4">
  {#if finished}
    {#if pData.textblock}
      <div class="whitespace-pre-line">
        {pData.textblock}
      </div>
    {/if}
  {:else}
    {#if pData.textblock}
      <div class="whitespace-pre-line">
        {pData.textblock}
      </div>
    {/if}

    {#each dynamicData as file}
      <div class="flex flex-row items-center space-x-3">
        <ImageExtern class="object-cover" src={file.file_ID} />
        <div class="ml-3 grow">
          {file.file_title}
        </div>
        {#if isDocumentSigned[file.file_ID]}
          <CheckIcon />
        {/if}
        {#if pData.button_1_text}
          <div>
            <Button
              color="primary"
              on:click={() => openPDF(file.file_ID, file.user_personal_prename, file.user_personal_lastname)}
            >
              {pData.button_1_text}
            </Button>
          </div>
        {/if}
      </div>
    {/each}

    <ProcessCardButtonRow
      {next}
      buttons={[{ text: pData.button_2_text, output: 'output_1', disabled: !isEveryDocumentSigned }]}
    />
  {/if}
</div>
