<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';
  import { useQuery } from '@sveltestack/svelte-query';

  // lib
  import { cardinal } from '$baselib/formater';
  import { NumberParser, ObjectParser, StringParser } from '$baselib/parse';
  import { htmlDecode, isObject, listToClass } from '$baselib/util';

  // components
  import WidgetContainer from './WidgetContainer.svelte';
  import SkeletonText from '$components/SkeletonText.svelte';

  // icons
  import ArrowIcon from '$icons/arrow.svg?component';

  export let edit = false;
  export let title = 'Widget';

  export let id = '';
  export let x = 0;
  export let y = 0;
  export let w = 1;
  export let h = 1;

  export let raportID = 'dashboarddefectfinish';
  export let name: string;
  export let data: unknown = undefined;
  export let color: 'white' | 'primary' | 'secondary' | 'alert' = 'white';

  const colorClass = {
    white: '',
    primary: 'bg-primary text-white border-0',
    secondary: 'bg-secondary text-white border-0',
    alert: 'bg-alert text-white border-0',
  };

  const resultConverter = new ObjectParser({
    data: new NumberParser(0),
    url: new StringParser(''),
  });

  $: reportResult = useQuery([`raport/getdata/${raportID}`, data], {
    select: resultConverter.toLocal,
  });

  $: hasData = $reportResult.isSuccess && isObject($reportResult.data);
</script>

<WidgetContainer
  class={[!hasData && $reportResult.isFetched && !edit && 'opacity-70 blur-sm', colorClass[color]].reduce(listToClass)}
  link={hasData && htmlDecode($reportResult.data.url)}
  {edit}
  {id}
  {x}
  {y}
  {w}
  {h}
  on:delete
>
  <svelte:fragment slot="title">
    {#if !edit && color === 'white'}
      <span class="text-primary">
        <slot name="icon" />
      </span>
    {:else if !edit}
      <slot name="icon" />
    {/if}
  </svelte:fragment>
  <ArrowIcon slot="icon" class={['w-5 h-5 rotate-180', color === 'white' && 'text-primary'].reduce(listToClass)} />

  {#if edit}
    <div>{title}</div>
  {:else if $reportResult.isLoading}
    <SkeletonText loadingWidth="w-10/12" />
  {:else}
    <p class="whitespace-nowrap truncate">
      {#if hasData}
        {@const data = $reportResult.data.data}
        {$_(`widget.${name}.${$cardinal.select(data)}`, {
          values: {
            value: data,
          },
        })}
      {:else}
        {$_(`widget.${name}.${$cardinal.select(0)}`, {
          values: {
            value: '?',
          },
        })}
      {/if}
    </p>
  {/if}
</WidgetContainer>
