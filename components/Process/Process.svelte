<script lang="ts" context="module">
  export type ProcessNextFunction = (output: string, data?: Record<string, unknown>) => Promise<void>;
</script>

<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';
  import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@sveltestack/svelte-query';
  import Mustache from 'mustache';

  // svelte
  import { browser } from '$app/env';
  import { onDestroy, setContext } from 'svelte';

  // lib
  import type { APIError } from '$baselib/api';
  import {
    ProcessActionRequest,
    UseProcessActionQuery,
    type APIProcessAction,
    type APIProcessActionStep,
    type APIProcessItemData,
  } from '$baselib/api/processaction';
  import { serverURL } from '$baselib/config';
  import { dateFormat, dateFromAPIDate, formatters, timeFormat } from '$baselib/formater';
  import { state, userHasRight } from '$baselib/stores';
  import { toArray } from '$baselib/util';

  // components
  import Card from '$components/Card/Card.svelte';
  import CardDivider from '$components/Card/CardDivider.svelte';
  import ProcessLoadingCard from './ProcessLoadingCard.svelte';
  import Loading from '$components/Loading.svelte';
  import Badge from '$components/Badge.svelte';
  import Nodata from '$components/Nodata.svelte';

  // process
  import Process12 from './Steps/Process12.svelte';
  import Process13 from './Steps/Process13.svelte';
  import Process14 from './Steps/Process14.svelte';
  import Process15 from './Steps/Process15.svelte';
  import Process16 from './Steps/Process16.svelte';
  import Process22 from './Steps/Process22.svelte';
  import Process26 from './Steps/Process26.svelte';
  import Process28 from './Steps/Process28.svelte';
  import Process30 from './Steps/Process30.svelte';
  import Process31 from './Steps/Process31.svelte';
  import Process32 from './Steps/Process32.svelte';
  import Process33 from './Steps/Process33.svelte';
  import Process34 from './Steps/Process34.svelte';
  import Process36 from './Steps/Process36.svelte';
  import { writable } from 'svelte/store';
  import { APIResponseError } from '$baselib/connection';

  const PROCESS_COMPONENT = {
    process_12: Process12,
    process_13: Process13,
    process_14: Process14,
    process_15: Process15,
    process_16: Process16,
    process_22: Process22,
    process_26: Process26,
    process_28: Process28,
    process_30: Process30,
    process_31: Process31,
    process_32: Process32,
    process_33: Process33,
    process_34: Process34,
    process_36: Process36,
  };

  export let actionID = '';
  export let processClass = '';
  export let processID = '';
  export let multiple = false;
  export let narrow = false;
  export { class_ as class };

  const narrowStore = writable(narrow);
  $: $narrowStore = narrow;

  setContext('narrow', narrowStore);

  const queryClient = useQueryClient();

  let class_ = '';
  let hashes: string[] = [];

  const processActionResult = useQuery<APIProcessAction[], APIError>({
    queryKey: 'tempkey',
    enabled: false,
  });

  function handleProcessActionSuccess(res: APIProcessAction[]) {
    hashes = res.map((action) => action.process_action_hash);

    enableNext = true;

    if (shouldScollIntoView) {
      cardContainer.parentElement.parentElement.scrollTo({ behavior: 'smooth', top: 0 });
      shouldScollIntoView = false;
    }
  }

  $: {
    if (multiple && processClass && processID) {
      processActionResult.setOptions({
        ...UseProcessActionQuery.getByClassMultiple_options(processClass, processID),
        onSuccess: handleProcessActionSuccess,
      });
    } else if (processClass && processID) {
      processActionResult.setOptions({
        ...UseProcessActionQuery.getByClass_options(processClass, processID),
        onSuccess: handleProcessActionSuccess,
      });
    } else {
      processActionResult.setOptions({
        ...(UseProcessActionQuery.get_options(actionID) as unknown as UseQueryOptions<APIProcessAction[], APIError>),
        select: toArray,
        onSuccess: handleProcessActionSuccess,
      });
    }
  }

  let shouldScollIntoView = false;

  $processActionResult;

  const processActionMutation = useMutation(
    ({ step, output, data }: { step: APIProcessActionStep; output: string; data: Record<string, string> }) =>
      ProcessActionRequest.next(
        step.process_action_ID,
        step.process_action_step_ID,
        step.process_item_ID,
        output,
        data,
      ),
    {
      onSuccess: () => {
        UseProcessActionQuery.invalidateProcessAction(queryClient, {
          process_action_ID: actionID,
          class_: processClass,
          class_ID: processID,
        });
      },
      onError: (e) => {
        // continue if step is already finished
        if (e instanceof APIResponseError && e.status === 423) {
          UseProcessActionQuery.invalidateProcessAction(queryClient, {
            process_action_ID: actionID,
            class_: processClass,
            class_ID: processID,
          });
        }
      },
    },
  );

  function mapObjectValues(obj: unknown, fn: (key: string | number, val: unknown, obj?: unknown) => unknown): unknown {
    if (Array.isArray(obj)) {
      return obj.map((val, key) => {
        if (obj[key] !== null && typeof obj[key] === 'object') {
          return mapObjectValues(obj[key], fn);
        } else {
          return fn(key, val, obj);
        }
      });
    }
    if (typeof obj === 'object' && obj !== null) {
      const res = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (obj[key] !== null && typeof obj[key] === 'object') {
            res[key] = mapObjectValues(obj[key], fn);
          } else {
            res[key] = fn(key, obj[key], obj);
          }
        }
      }

      return res;
    } else {
      return fn('', obj);
    }
  }

  function formatData<T>(data: T | string, format: unknown): T | string {
    if (Array.isArray(data) && format !== 'enumerate') {
      for (let i = 0; i < data.length; i++) {
        data[i] = formatData(data[i], format);
      }
    } else {
      if (typeof format === 'string') {
        if (format in formatters) {
          const formatter = formatters[format];
          try {
            data = formatter(data);
          } catch (e) {
            console.warn(`Formater '%s' failed with data %o`, format, data);
          }
        } else {
          console.warn(`formater ${format} not found`);
        }
      } else if (typeof format === 'object' && format !== null && typeof data === 'object' && data !== null) {
        for (const key in format) {
          if (key in data) {
            if (typeof format[key] === 'string') data[key + '_orig'] = data[key];
            data[key] = formatData(data[key], format[key]);
          }
        }
      }
    }

    return data;
  }

  function renderProcessItemData(process_step: APIProcessActionStep): APIProcessItemData {
    // @ts-ignore
    Mustache.escape = function (text) {
      return text;
    };

    let dynamicData = {};

    if (process_step.processitemdatadynamic) {
      dynamicData = mapObjectValues(process_step.processitemdatadynamic, (key, value, obj: Record<string, unknown>) =>
        obj !== undefined && key + '_format' in obj ? formatData(value, obj[key + '_format']) : value,
      );
    }

    return mapObjectValues(process_step.processitemdata, (_key, value: string, _obj) =>
      Mustache.render(value, dynamicData),
    ) as APIProcessItemData;
  }

  let sources: EventSource[];

  $: if (!sources && browser && $userHasRight('processaction', 'gethash') && $processActionResult.isSuccess) {
    sources = $processActionResult.data.map((action, i) => {
      const source = new EventSource(
        `${serverURL}processaction/gethash/${action.process_action_ID}?session=${$state.session}`,
      );

      source.addEventListener(
        'message',
        function (e) {
          const obj = JSON.parse(e.data);

          if (hashes[i] != obj.success.data) {
            UseProcessActionQuery.invalidateProcessAction(queryClient, {
              process_action_ID: actionID,
              class_: processClass,
              class_ID: processID,
            });

            hashes[i] = obj.success.data;
          }
        },
        false,
      );

      return source;
    });
  }

  onDestroy(() => {
    if (sources) {
      for (const source of sources) {
        source.close();
      }
    }
  });

  export let noData = false;

  let enableNext = true;

  function getStartTimeString(start: string): string {
    const startDate = dateFromAPIDate(start);
    const datetime = $dateFormat.format(startDate) + ' ' + $timeFormat.format(startDate);

    return $_('process.start', { values: { datetime } });
  }

  function getEndTimeString(end: string): string {
    const endDate = dateFromAPIDate(end);
    const datetime = $dateFormat.format(endDate) + ' ' + $timeFormat.format(endDate);

    return $_('process.end', { values: { datetime } });
  }

  let cardContainer: HTMLElement;
</script>

{#if !$userHasRight('processaction', 'getbyclass')}
  <Nodata>
    <svelte:fragment slot="title">{$_('error.insufficient_rights_title')}</svelte:fragment>
    <svelte:fragment slot="text">{$_('error.insufficient_rights_text')}</svelte:fragment>
  </Nodata>
{:else if $processActionResult.isLoading || $processActionResult.isIdle}
  <Loading center={true} />
{:else if ($processActionResult.isSuccess && !$processActionResult.data) || ($processActionResult.isSuccess && $processActionResult.data.length === 0) || $processActionResult.isError}
  <Nodata>
    <svelte:fragment slot="title">{$_('process.no_process')}</svelte:fragment>
    <svelte:fragment slot="text">{$_('process.no_process_text', { default: '' })}</svelte:fragment>
  </Nodata>
{:else}
  {#if $processActionResult.data.every((action) => toArray(action.process_action_step).length === 0) || $processActionResult.data.some((action) => action.process_action_hash_details.process_item_background && !action.process_action_hash_details.process_item_foreground)}
    <div class="{class_} mt-4">
      <ProcessLoadingCard value={$_('process.loading')} />
    </div>
  {:else if $processActionResult.data.some((action) => !action.process_action_hash_details.process_item_background && action.process_action_hash_details.process_item_hidden)}
    <div class="{class_} mt-4">
      <div class="c-card c-card-container flex flex-col flex-grow justify-center items-center {class_}">
        <p>{$_('process.message_hidden')}</p>
      </div>
    </div>
  {/if}
  <div class={class_} bind:this={cardContainer}>
    {#each $processActionResult.data as process (process.process_ID)}
      {#each toArray(process.process_action_step) as step (step.process_action_step_ID)}
        {@const processitemdata = renderProcessItemData(step)}
        {@const finished = Boolean(step.process_action_step_end)}
        {@const isInvalid = Array.isArray(processitemdata) || typeof processitemdata !== 'object'}
        <Card class="mt-4 {finished ? 'opacity-50' : ''} " {noData}>
          <svelte:fragment slot="title">
            {isInvalid ? $_('process.item.error') : processitemdata.title || $_('process.item.no_title')}
          </svelte:fragment>
          <CardDivider />
          {#if isInvalid}
            <div>{$_('process.item.error_text')}</div>
          {:else if step.template_key in PROCESS_COMPONENT}
            <svelte:component
              this={PROCESS_COMPONENT[step.template_key]}
              {finished}
              data={processitemdata}
              {step}
              ID={processID}
              next={enableNext &&
                ((output, data = {}) => {
                  $processActionMutation.mutate({
                    step,
                    output,
                    data,
                  });
                  shouldScollIntoView = true;
                  enableNext = false;
                })}
            />
          {:else}
            missing template {step.template_key}
          {/if}
          <CardDivider />
          <div class="flex justify-content-start align-items-center">
            {getStartTimeString(step.process_action_step_start)}
            {#if !step.process_action_step_end}
              <Badge class="ml-auto mr-0 h-6 bg-secondary text-white">{$_('process.open')}</Badge>
            {:else}
              <br />
              {getEndTimeString(step.process_action_step_end)}
              <Badge class="ml-auto mr-0 h-6 mt-3 bg-success text-white">{$_('process.done')}</Badge>
            {/if}
          </div>
        </Card>
      {/each}
    {/each}
  </div>
{/if}
