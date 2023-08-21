<!-- Datei bereitstellen und pruefen -->
<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // svelte
  import { getContext } from 'svelte/internal';

  // lib
  import { APIFileViewRight, FileRequest } from '$baselib/api/file';
  import type { APIProcessActionStep, APIProcessItemData } from '$baselib/api/processaction';
  import { ArrayParser, ObjectParser, StringParser } from '$baselib/parse';

  // components
  import Button from '$components/Form/Button.svelte';
  import ImageExtern from '$components/ImageExtern.svelte';
  import ModalPdfViewer from '$components/Modal/ModalPDFViewer.svelte';
  import ProcessCardButtonRow from '../ProcessCardButtonRow.svelte';
  import type { ModalContext } from '$components/Modal/ModalProvider.svelte';
  import type { ProcessNextFunction } from '../Process.svelte';

  // icons
  import CheckIcon from '$icons/checkmark.svg?component';

  export let finished = false;
  export let data: APIProcessItemData;
  export let step: APIProcessActionStep;
  export let next: ProcessNextFunction;

  const dataParser = new ObjectParser({
    textblock: new StringParser(),
    button_1_text: new StringParser(),
    button_2_text: new StringParser(),
    button_3_text: new StringParser(),
  });

  let pData = dataParser.toLocal(data);
  $: pData = dataParser.toLocal(data);

  const dynamicDataParser = new ArrayParser(
    new ObjectParser({
      file_ID: new StringParser(),
      file_title: new StringParser(),
    }),
  );

  let dynamicData = dynamicDataParser.toLocal(step.processitemdatadynamic);
  $: dynamicData = dynamicDataParser.toLocal(step.processitemdatadynamic);

  let clicked: Record<string, boolean> = {};
  $: clicked = Object.fromEntries(dynamicData.map((file) => [file.file_ID, clicked[file.file_ID] ?? false]));

  /* Modal Utility */
  const { open } = getContext<ModalContext>('simple-modal');

  function openPDF(url: string) {
    clicked[url] = true;
    open(
      ModalPdfViewer,
      {
        url: url,
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
  {#if pData.textblock}
    <div class="whitespace-pre-line">
      {pData.textblock}
    </div>
  {/if}

  {#each dynamicData as file}
    <div class="flex flex-row items-center space-x-3">
      <ImageExtern class="object-cover shrink-0" src={file.file_ID} />
      <div class="ml-3 grow truncate" title={file.file_title}>
        {file.file_title}
      </div>
      {#if !finished && clicked[file.file_ID]}
        <CheckIcon class="shrink-0" />
      {/if}
      {#if pData.button_1_text}
        <div>
          <Button color="primary" on:click={() => openPDF(file.file_ID)}>
            {pData.button_1_text}
          </Button>
        </div>
      {/if}
    </div>
  {/each}

  {#if !finished}
    <ProcessCardButtonRow
      {next}
      buttons={[
        { text: pData.button_3_text, output: 'output_2' },
        { text: pData.button_2_text, output: 'output_1' },
      ]}
    />
  {/if}
</div>
