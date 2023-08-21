<script lang="ts" context="module">
  import { _ } from 'svelte-i18n';
  import { derived } from 'svelte/store';

  export const selectValueStore = derived(
    _,
    ($_) =>
      function (name: string, value: string, short = false, fallback: 'dash' | 'value' = 'dash'): string {
        const effectiveFallback = (function () {
          switch (fallback) {
            case 'value':
              return `${value}`;

            case 'dash':
            default:
              return '-';
          }
        })();
        if (short) {
          return $_(`select.${name}-short.${value}`, {
            default: $_(`select.${name}.${value}`, { default: effectiveFallback }),
          });
        } else {
          return $_(`select.${name}.${value}`, {
            default: $_(`select.${name}-short.${value}`, { default: effectiveFallback }),
          });
        }
      },
  );
</script>

<script lang="ts">
  import { isObject } from '$baselib/util';

  import { json } from 'svelte-i18n';
  import Select, { type SelectOption } from './Select.svelte';

  export let type: 'normal' | 'small' = 'normal';
  export let white = false;
  export let placeholder = '';
  export let label = '';
  export let name = '';
  export let value = '';
  export let options = name;
  export let short = false;
  export let disabled = false;
  // Message to display, when an Error occurs. Doesn't show anything if the string is empty.
  export let errormsg = '';
  // Hide the error message, even if `errormsg` is set.
  export let showerror = true;

  let class_ = '';
  export { class_ as class };
  export let selectClass = '';
  export let labelClass = '';

  function getOptions(json: { default?: Record<string, string>; short?: Record<string, string> }): SelectOption[] {
    const shortMap = isObject(json.short) ? json.short : {};
    const defaultMap = isObject(json.default) ? json.default : {};

    const map = short ? Object.assign({}, defaultMap, shortMap) : Object.assign({}, shortMap, defaultMap);

    if (value && !(value in map)) {
      map[value] = value;
    }

    let entries = Object.entries(map);

    if (entries.length === 0) {
      entries = [['_', 'Keine Optionen vorhanden!']];
    }

    return entries.map(([value, label]) => ({
      value,
      label: label as string,
    }));
  }

  $: localOptions = getOptions({
    default: ($json(`select.${options}`) as Record<string, string>) ?? {},
    short: ($json(`select.${options}-short`) as Record<string, string>) ?? {},
  });
</script>

<Select
  {type}
  {white}
  {placeholder}
  {label}
  {name}
  bind:value
  options={localOptions}
  {disabled}
  {errormsg}
  {showerror}
  class={class_}
  {selectClass}
  {labelClass}
/>
