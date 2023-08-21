<script lang="ts">
  // node modules
  import { v4 as uuidv4 } from 'uuid';
  import { parseRelativeDate, todayPlusDays } from '$baselib/formater';
  import { listToClass } from '$baselib/util';
  import { createEventDispatcher } from 'svelte';

  import { _ } from 'svelte-i18n';
  import ErrorMessage from './ErrorMessage.svelte';

  export let label = '';
  export let disabled = false;
  export let value: string[] = ['', ''];
  let class_ = '';
  export { class_ as class };
  // Message to display, when an Error occurs. Doesn't show anything if the string is empty.
  export let errormsg = '';
  // Hide the error message, even if `errormsg` is set.
  export let showerror = true;
  export let inputClass = '';

  let id = uuidv4();

  $: today = todayPlusDays(2).toISOString().slice(0, 'YYYY-MM-DDTHH:MM'.length);

  const dispatch = createEventDispatcher();

  const handleChange = (i: number) => (ev: Event) => {
    value = value.slice(0, 2);
    if (ev.target instanceof HTMLInputElement) {
      value[i] = ev.target.value ?? '';
      dispatch('change', value);
    }
  };

  export const removeAll = () => {
    value = ['', ''];
  };
</script>

<div class={class_}>
  <label class="c-label" for={id}>
    {label}
  </label>

  <div class="sm:flex sm:flex-row sm:space-x-2">
    <input
      {id}
      class={['c-input', label && 's-label', showerror && errormsg && 's-error', inputClass].reduce(listToClass)}
      min={today}
      value={parseRelativeDate(value[0] ?? '').toISODate()}
      type="date"
      {disabled}
      on:change={handleChange(0)}
    />
    <input
      class={['c-input', label && 's-label', showerror && errormsg && 's-error', inputClass].reduce(listToClass)}
      min={today}
      value={parseRelativeDate(value[1] ?? '').toISODate()}
      type="date"
      {disabled}
      on:change={handleChange(1)}
    />
  </div>
  <ErrorMessage msg={errormsg} show={showerror} />
</div>
