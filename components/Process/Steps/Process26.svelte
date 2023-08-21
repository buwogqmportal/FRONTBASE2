<!-- Persoehnliche Daten ergaenzen -->
<script lang="ts">
  // node modules
  import { useQuery, useQueryClient } from '@sveltestack/svelte-query';
  import { _ } from 'svelte-i18n';

  // app
  import { browser } from '$app/env';

  // lib
  import type { APIError } from '$baselib/api';
  import type { APIProcessItemData } from '$baselib/api/processaction';
  import type { APIUser } from '$baselib/api/user';
  import { ObjectParser, StringParser } from '$baselib/parse';
  import { userHasRight } from '$baselib/stores';

  // components
  import Process26Form from './_Process26Form.svelte';
  import type { ProcessNextFunction } from '../Process.svelte';
  import Form from '$components/Form.svelte';
  import ProcessCardButtonRow from '../ProcessCardButtonRow.svelte';

  const queryClient = useQueryClient();

  export let finished = false;
  export let data: APIProcessItemData;
  export let next: ProcessNextFunction;

  const dataParser = new ObjectParser({
    textblock: new StringParser(),
    button_1_text: new StringParser(),
    button_2_text: new StringParser(),
  });

  let pData = dataParser.toLocal(data);
  $: pData = dataParser.toLocal(data);

  let form: HTMLFormElement;

  $: userResult = useQuery<APIUser, APIError>(
    [
      `user/get`,
      {
        defect_data_type_priority: '2',
      },
    ],
    {
      enabled: browser && $userHasRight('user', 'get'),
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );
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

    {#if $userResult.isSuccess}
      <Form
        action="user/update"
        on:success={() => queryClient.invalidateQueries(['user/get'])}
        options={{ user_ID: $userResult.data.user_ID, user_mail: undefined }}
        bind:form
      >
        <Process26Form data={$userResult.data} />
      </Form>
    {/if}

    <ProcessCardButtonRow
      {next}
      buttons={[
        { text: pData.button_2_text, output: 'output_2' },
        {
          text: pData.button_1_text,
          color: 'primary',
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
