<!-- Entscheidung -->
<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // lib
  import type { APIProcessItemData } from '$baselib/api/processaction';
  import { ObjectParser, StringParser } from '$baselib/parse';

  // components
  import type { ProcessNextFunction } from '../Process.svelte';
  import ProcessCardButtonRow from '../ProcessCardButtonRow.svelte';

  export let finished = false;
  export let data: APIProcessItemData;
  export let next: ProcessNextFunction;

  const dataParser = new ObjectParser({
    textblock: new StringParser(),
    button_1_text: new StringParser(),
    button_2_text: new StringParser(),
    button_3_text: new StringParser(),
    button_4_text: new StringParser(),
  });

  let pData = dataParser.toLocal(data);
  $: pData = dataParser.toLocal(data);
</script>

<div class="space-y-4 mt-4">
  {#if finished}
    {#if pData.textblock}
      <div class="whitespace-pre-line">
        {@html pData.textblock}
      </div>
    {/if}
  {:else}
    {#if pData.textblock}
      <div class="whitespace-pre-line">
        {@html pData.textblock}
      </div>
    {/if}

    <ProcessCardButtonRow
      {next}
      buttons={[
        { text: pData.button_2_text, output: 'output_2' },
        { text: pData.button_3_text, output: 'output_3' },
        { text: pData.button_4_text, output: 'output_4' },
        { text: pData.button_1_text, output: 'output_1' },
      ]}
    />
  {/if}
</div>
