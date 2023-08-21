<script lang="ts">
  // node modules
  import { useMutation, useQuery } from '@sveltestack/svelte-query';
  import { _ } from 'svelte-i18n';

  // svelte
  import { browser } from '$app/env';
  import { getContext } from 'svelte';

  // lib
  import type { APIError, APIErrorMsg } from '$baselib/api';
  import { type APIProcessComponentParameter, type APIProcessItem, ProcessItemRequest } from '$baselib/api/processitem';
  import { connectionSend, userHasRight } from '$baselib/stores';
  import { parseType, toBoolean } from '$baselib/util';

  // component
  import Badge from '$components/Badge.svelte';
  import Button from '$components/Form/Button.svelte';
  import CardDivider from '$components/Card/CardDivider.svelte';
  import Checkbox from '$components/Form/Checkbox.svelte';
  import Code from '$components/Form/Code.svelte';
  import DatePicker from '$components/Form/DatePicker.svelte';
  import FileUpload from '$components/Form/FileUpload.svelte';
  import Form from '$components/Form.svelte';
  import Input from '$components/Form/Input.svelte';
  import Select from '$components/Form/Select.svelte';
  import Textarea from '$components/Form/Textarea.svelte';
  import Translation from '$components/Form/Translation.svelte';
  import type { ModalContext } from '$components/Modal/ModalProvider.svelte';

  // icons
  import ErrorIcon from '$icons/removable.svg?component';
  import Circle from 'svelte-loading-spinners/dist/ts/Circle.svelte';
  import { element } from 'svelte/internal';

  export let process_ID: string;
  export let process_item_ID: string;

  const { close } = getContext<ModalContext>('simple-modal');

  $: processKey = [
    'processitem/get',
    {
      process_item_ID,
    },
  ];

  $: processResult = useQuery<APIProcessItem, APIError>(
    processKey,
    () => ProcessItemRequest.get(process_item_ID, true),
    {
      select: (item) => {
        return {
          ...item,
          process_component_parameter: item.process_component_parameter
            .map((p) => ({
              ...p,
              process_component_element: p.process_component_element.filter((e) => !e.process_component_element_system),
            }))
            .filter((p) => p.process_component_element.length > 0),
        };
      },
      enabled: browser && $userHasRight('process', 'get') && Boolean(process_item_ID),
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      onSuccess() {
        requestAnimationFrame(() => {
          initialFrame = false;
        });
      },
    },
  );

  const processItemUpdateMutation = useMutation(
    async (data: FormData) => {
      await $connectionSend('processitemdata/updateall', data);
    },
    {
      onSuccess() {
        close();
      },
    },
  );

  $: if ($processResult.isSuccess && !tab) {
    tab = $processResult.data.process_component_parameter[0].process_component_element_group_ID;
  }

  let tab: string = '';
  let errors: Record<string, APIErrorMsg> = {};

  function countErrorsInTab(parameter: APIProcessComponentParameter, errors: Record<string, APIErrorMsg>): number {
    return parameter.process_component_element.filter((p) => p.process_component_element_key in errors).length;
  }

  let initialFrame = true;
</script>

{#if $processResult.isSuccess}
  <div class="flex flex-row space-x-2">
    {#each $processResult.data.process_component_parameter as parameter}
      {@const errorCount = countErrorsInTab(parameter, errors)}
      <Badge
        type="round"
        class="relative hover:bg-secondary-lighter transition-colors 
        {parameter.process_component_element_group_ID === tab
          ? 'bg-primary text-white cursor-pointer'
          : 'cursor-pointer'}"
        clickable
        on:click={() => (tab = parameter.process_component_element_group_ID)}
        >{parameter.process_component_element_group_title}
        {#if errorCount > 0}
          <span class="absolute bg-alert w-4 h-4 rounded-lg -bottom-1 -right-1 text-white text-xs text-center leading-4"
            >{errorCount}</span
          >
        {/if}
      </Badge>
    {/each}
    <div class="grow" />
    <!-- <Badge type="round">Aktiver Schritt</Badge>
    <Badge type="round" class={true ? 'bg-primary text-white cursor-pointer' : 'cursor-pointer'}
      >Abgeschlossener Schritt</Badge
    > -->
  </div>

  <Form
    action={(data) => $processItemUpdateMutation.mutate(data)}
    root="process_item"
    id={process_item_ID}
    options={{
      process_ID,
      process_item_ID,
    }}
    bind:errors
    let:isLoading
    let:hasErrors
    let:isSubmitting
  >
    {#each $processResult.data.process_component_parameter as parameter}
      {@const hidden = !initialFrame && !isLoading && parameter.process_component_element_group_ID !== tab}
      <div class="space-y-6 mb-6" {hidden}>
        {#each parameter.process_component_element as element}
          {@const element_type = parseType(element.process_component_element_type)}
          {#if $userHasRight('processcomponent', 'editall') || ['textarea', 'input', 'image', 'file'].includes(element_type.type)}
            <div class="flex-1">
              {#if element_type.type === 'textarea_system'}
                <Textarea
                  name={element.process_component_element_key}
                  label={element.process_component_element_title ?? ''}
                  value={element.process_item_data_data ?? ''}
                />
              {:else if element_type.type === 'textarea'}
                <Translation
                  name={element.process_component_element_key}
                  label={element.process_component_element_title ?? ''}
                  fallback={element.process_item_data_data ?? ''}
                  let:loading
                  let:value
                  let:set
                  let:id
                >
                  <Textarea
                    {id}
                    {value}
                    class="mt-1"
                    on:input={(e) => set(e.detail)}
                    placeholder={element.process_component_element_title ?? ''}
                    disabled={loading}
                  />
                </Translation>
              {:else if element_type.type === 'input_system'}
                <Input
                  name={element.process_component_element_key}
                  label={element.process_component_element_title ?? ''}
                  value={element.process_item_data_data ?? ''}
                />
              {:else if element_type.type === 'image' || element_type.type === 'file'}
                <FileUpload
                  single
                  name={element.process_component_element_key}
                  label={element.process_component_element_title}
                  placeholder={$_('process.details.edit_file_placeholder')}
                  file={element.process_item_data_data ?? ''}
                  button={$_('process.details.edit_file_button')}
                />
              {:else if element_type.type === 'date'}
                <DatePicker
                  name={element.process_component_element_key}
                  label={element.process_component_element_title ?? ''}
                  value={element.process_item_data_data ?? ''}
                />
              {:else if element_type.type === 'number'}
                <Input
                  type="number"
                  name={element.process_component_element_key}
                  label={element.process_component_element_title ?? ''}
                  value={element.process_item_data_data ?? ''}
                />
              {:else if element_type.type === 'checkbox'}
                <Checkbox
                  name={element.process_component_element_key}
                  label={element.process_component_element_title ?? ''}
                  checked={toBoolean(element.process_item_data_data)}
                />
              {:else if element_type.type === 'code'}
                <Code
                  name={element.process_component_element_key}
                  label={element.process_component_element_title ?? ''}
                  value={element.process_item_data_data ?? ''}
                  type={Object.keys(element_type.data)[0]}
                />
              {:else if element_type.type === 'select_system'}
                <Select
                  name={element.process_component_element_key}
                  label={element.process_component_element_title ?? ''}
                  options={(function () {
                    try {
                      return Object.entries(JSON.parse(element.process_component_element_function))?.map(
                        ([value, label]) => ({ label: label.toString(), value: value.toString() }),
                      );
                    } catch (e) {
                      return [{ label: 'Fehler beim lesen der Optionen!' }];
                    }
                  })()}
                  value={element.process_item_data_data}
                />
              {:else if element_type.type === 'separator_system'}
                {#if element.process_component_element_title}
                  <h4 class="mb-2">{element.process_component_element_title}</h4>
                {/if}
                <CardDivider />
              {:else}
                <Translation
                  name={element.process_component_element_key}
                  label={element.process_component_element_title ?? ''}
                  fallback={element.process_item_data_data ?? ''}
                  let:loading
                  let:value
                  let:set
                  let:id
                >
                  <Input
                    {id}
                    {value}
                    class="mt-1"
                    on:input={(e) => set(e.detail)}
                    placeholder={element.process_component_element_title ?? ''}
                    disabled={loading}
                  />
                </Translation>
              {/if}
              <p class="text-sm text-secondary/70 mt-1">
                {element.process_component_element_description}
              </p>
            </div>
          {:else}
            <div />
          {/if}
        {/each}
      </div>
    {/each}

    <div class="grid grid-cols-1 menu:grid-cols-2">
      <Button
        submit
        color={hasErrors ? 'alert' : 'primary'}
        class="menu:col-start-2 flex items-center justify-center space-x-1"
      >
        {#if hasErrors}
          <ErrorIcon class="inline-block w-5 h-5" />
        {:else if isSubmitting}
          <Circle size="1.25" unit="rem" color="white" />
        {/if}
        <span>{$_('process.details.edit_save')}</span>
      </Button>
    </div>
  </Form>
{/if}
