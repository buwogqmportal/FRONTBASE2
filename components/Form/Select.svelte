<script context="module" lang="ts">
  import { getProperty, isObjectOrArray, listToClass, toArray } from '$baselib/util';
  import { _ } from 'svelte-i18n';

  export type SelectOption = { value?: string; label?: string };

  export function toSelectOptions(
    obj: unknown[],
    valueKey: string | number,
    labelKey?: string | number,
  ): SelectOption[] {
    obj = toArray(obj);

    return obj.filter(isObjectOrArray).map((data) => ({
      value: getProperty(data, valueKey)?.toString(),
      label: getProperty(data, labelKey)?.toString(),
    }));
  }

  export function selectOptionValue(option: SelectOption, emptyValue = true) {
    if (emptyValue) return option.value || option.label || '';
    else return option.value ?? (option.label || '');
  }

  export function selectOptionLabel(option: SelectOption) {
    return option.label || option.value || '';
  }
</script>

<script lang="ts">
  // components
  import ErrorMessage from './ErrorMessage.svelte';

  export let element: HTMLSelectElement = null;

  export let type: 'normal' | 'small' = 'normal';
  export let white = false;
  export let placeholder = '';
  export let label = '';
  export let name = '';
  export let value = '';
  export let options: SelectOption[] = [];
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

  $: showPlaceholder = !first;

  $: if (element && options.length > 0 && !options.find((o) => selectOptionValue(o) === value)) {
    value = showPlaceholder ? '' : options[0].value ?? options[0].label;
  }
</script>

<div class={class_}>
  <label class={['c-label', labelClass].reduce(listToClass)}>
    {label}
    <select
      bind:this={element}
      class={[
        'c-input',
        label && 's-label',
        white && 'bg-white',
        {
          normal: 'pr-8',
          small: 'py-2 pl-3 pr-8 leading-4',
        }[type],
        showerror && errormsg && 's-error',
        selectClass,
      ].reduce(listToClass)}
      {name}
      {disabled}
      bind:value
      on:change
    >
      {#if showPlaceholder}
        <option value="" disabled>{placeholder || $_('components.select.option_placeholder', { default: '--' })}</option
        >
      {/if}

      {#each options as option}
        <option value={selectOptionValue(option)}>{selectOptionLabel(option)}</option>
      {/each}
    </select>
    {#if disabled}<input {name} {value} hidden /> {/if}
  </label>
  <ErrorMessage {name} msg={errormsg} show={showerror} />
</div>
