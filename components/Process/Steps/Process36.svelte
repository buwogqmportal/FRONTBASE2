<!-- Information -->
<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // lib
  import type { APIProcessActionStep, APIProcessItemData } from '$baselib/api/processaction';
  import { BooleanParser, ObjectParser, StringParser } from '$baselib/parse';
  import { userHasRight } from '$baselib/stores';

  // components
  import type { ProcessNextFunction } from '../Process.svelte';
  import Link from '$components/Link.svelte';
  import Button from '$components/Form/Button.svelte';

  export let finished = false;
  export let data: APIProcessItemData;
  export let next: ProcessNextFunction;
  export let step: APIProcessActionStep;

  const dataParser = new ObjectParser({
    textblock: new StringParser(),
    logo_show: new BooleanParser(),
    button_1_text: new StringParser(),
    button_2_text: new StringParser(),
  });

  let pData = dataParser.toLocal(data);
  $: pData = dataParser.toLocal(data);

  const dynamicDataParser = new ObjectParser({
    signatureLink: new StringParser(),
  });

  let dynamicData = dynamicDataParser.toLocal(step.processitemdatadynamic);
  $: dynamicData = dynamicDataParser.toLocal(step.processitemdatadynamic);

  $: signatureLink = dynamicData?.signatureLink;

  let clicked = false;
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

    {#if $userHasRight('processaction', 'next')}
      <div class="grid gap-4 grid-cols-1 md:grid-cols-2">
        {#if pData.button_2_text}
          <Button class="md:last:odd:col-start-2" color={'secondary'} on:click={() => next('output_2', data)}>
            {pData.button_2_text}
          </Button>
        {/if}
        {#if pData.button_1_text || pData.logo_show}
          <Link
            class="md:last:odd:col-start-2 flex justify-center items-center {pData.logo_show ? 'p-2' : ''}"
            href={(signatureLink || '').replace(/&amp;/g, '&')}
            newTab
            type="button"
            color={clicked ? 'secondary' : 'primary'}
            on:click={() => (clicked = true)}
          >
            {pData.button_1_text}
            {#if pData.logo_show}
              <img class="inline-block h-7 ml-3" src="/logo_yousign_white.png" alt="You Sign Logo" />
            {/if}
          </Link>
        {/if}
      </div>
    {/if}
  {/if}
</div>
