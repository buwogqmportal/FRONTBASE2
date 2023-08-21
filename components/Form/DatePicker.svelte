<script lang="ts">
  import { listToClass } from '$baselib/util';
  import { v4 as uuidv4 } from 'uuid';

  import { DateTime } from 'luxon';

  // components
  import ErrorMessage from './ErrorMessage.svelte';
  import { now } from '$baselib/stores';
  import { createEventDispatcher } from 'svelte';

  export let type: 'date' | 'datetime-local' = 'datetime-local';
  export let label = '';
  export let name = '';
  export let value = '';
  export let disabled = false;
  export let disable_past = true;
  // Message to display, when an Error occurs. Doesn't show anything if the string is empty.
  export let errormsg = '';
  // Hide the error message, even if `errormsg` is set.
  export let showerror = true;

  export let id = uuidv4();

  let today = $now.startOf('day').plus({ day: 1 });
  $: today = $now.startOf('day').plus({ day: 1 });

  let class_ = '';
  export { class_ as class };
  export let inputClass = '';

  const dispatch = createEventDispatcher();

  const handleDateChange = (e: Event) => {
    const input = e.target as HTMLInputElement;

    if (input.value) {
      value = input.value + (substring(value, '0000-00-00', 'T00:00') || 'T08:00');
    } else {
      value = '';
    }

    dispatch('change', value);
  };

  const handleTimeChange = (e: Event) => {
    const input = e.target as HTMLInputElement;

    if (input.value && value) {
      value = substring(value, '0000-00-00') + 'T' + input.value;
    } else {
      value = '';
    }

    dispatch('change', value);
  };

  function range(from: number, to: number, step: number): number[] {
    const res: number[] = [];

    for (let i = from; i < to; i += step) {
      res.push(i);
    }

    return res;
  }

  const times = range(6 * 60, 22 * 60 + 1, 15).map((i) =>
    DateTime.fromObject({ hour: Math.floor(i / 60), minute: i % 60 }).toFormat('T'),
  );

  function substring(value: string, end: string): string;
  function substring(value: string, start: string, end: string): string;
  function substring(value: string, start: string, end?: string): string {
    if (typeof end === 'string') {
      return value.substring(start.length, start.length + end.length);
    } else {
      return value.substring(0, start.length);
    }
  }
</script>

<div class={class_}>
  <label class="c-label relative" for={id}>
    {label}
    <div class="flex flex-row space-x-2">
      <input
        {id}
        class={['c-input flex-grow', label && 's-label', showerror && errormsg && 's-error', inputClass].reduce(
          listToClass,
        )}
        {name}
        value={substring(value, '0000-00-00')}
        min={disable_past ? today.toISODate() : ''}
        type="date"
        placeholder={today.toISODate()}
        {disabled}
        on:input
        on:change={handleDateChange}
        on:keypress
        on:keydown|preventDefault
      />
      {#if type === 'datetime-local'}
        <select
          class={['c-input w-40', label && 's-label', showerror && errormsg && 's-error', inputClass].reduce(
            listToClass,
          )}
          value={'08:00'}
          disabled={!value}
          on:change={handleTimeChange}
        >
          {#each times as time}
            <option value={time}>{time} Uhr</option>
          {/each}
        </select>
      {/if}
    </div>
  </label>

  <ErrorMessage {name} msg={errormsg} show={showerror} />
</div>
