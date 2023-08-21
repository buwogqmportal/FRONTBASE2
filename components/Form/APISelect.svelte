<script lang="ts">
  import { browser } from '$app/env';

  import type { APIError } from '$baselib/api';

  import { getProperty, isObject, toArray } from '$baselib/util';
  import { useQuery, type QueryKey } from '@sveltestack/svelte-query';

  import Select, { toSelectOptions, type SelectOption } from './Select.svelte';

  export let type: 'normal' | 'small' = 'normal';
  export let white = false;
  export let placeholder = '';
  export let label = '';
  export let name = '';
  export let value = '';
  export let options: SelectOption[] = [];
  export let query: QueryKey;
  export let unwrap = '';
  export let filter = (_data: any) => true;
  export let valueKey = '';
  export let labelKey = '';
  export let right = true;
  export let disabled = false;
  export let first = false;
  // Message to display, when an Error occurs. Doesn't show anything if the string is empty.
  export let errormsg = '';
  // Hide the error message, even if `errormsg` is set.
  export let showerror = true;

  let class_ = '';
  export { class_ as class };
  export let selectClass = '';
  export let labelClass = '';

  $: apiResult = useQuery<Record<string, string>[], APIError>(query, {
    enabled: browser && right,
    select: (data) => {
      const res = options.concat(
        toSelectOptions(
          toArray(unwrap ? (getProperty(data, unwrap) as Record<string, string>) : data).filter((data: any) =>
            filter(data),
          ),
          valueKey,
          labelKey,
        ),
      );

      return res;
    },
  });
</script>

{#if $apiResult.isSuccess}
  <Select
    {type}
    {first}
    {white}
    {placeholder}
    {label}
    {name}
    bind:value
    options={$apiResult.data ?? [
      {
        value,
        label: placeholder || label,
      },
    ]}
    {disabled}
    {errormsg}
    {showerror}
    class={class_}
    {selectClass}
    {labelClass}
    on:change
  />
{:else}
  <Select
    {type}
    {white}
    {placeholder}
    {label}
    {name}
    {value}
    options={$apiResult.data ?? [
      {
        value,
        label: placeholder || label,
      },
    ]}
    disabled
    class={class_}
    {selectClass}
    {labelClass}
  />
  <input hidden {name} {value} />
{/if}
