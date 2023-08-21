<script lang="ts">
  import { listToClass } from '$baselib/util';

  // svelte
  import { createEventDispatcher } from 'svelte';
  import { v4 as uuidv4 } from 'uuid';

  // components
  import ErrorMessage from './ErrorMessage.svelte';
  import type { SelectOption } from './Select.svelte';

  const dispatch = createEventDispatcher();

  const listID = uuidv4();

  export let id = uuidv4();

  export let type: 'text' | 'email' | 'password' | 'number' = 'text';
  export let placeholder = '';
  export let label = '';
  export let name = '';
  export let value = '';
  export let disabled = false;
  // Message to display, when an Error occurs. Doesn't show anything if the string is empty.
  export let errormsg = '';
  // Hide the error message, even if `errormsg` is set.
  export let showerror = true;

  export let input: HTMLInputElement = null;

  export let options: SelectOption[] = [];

  let class_ = '';
  export { class_ as class };
  export let inputClass = '';

  const handleInput = (e: Event) => {
    const input = e.target as HTMLInputElement;
    value = input.value;
    dispatch('input', value);
  };
</script>

<div class={class_}>
  {#if label}
    <label class="c-label" for={id}>
      {label}
    </label>
  {/if}

  <input
    {id}
    list={listID}
    class={['c-input', label && 's-label', showerror && errormsg && 's-error', inputClass].reduce(listToClass)}
    {name}
    placeholder={placeholder || label}
    {value}
    {type}
    {disabled}
    bind:this={input}
    on:input={handleInput}
    on:change
    on:keypress
  />
  {#if options?.length}
    <datalist id={listID}>
      {#each options as { value, label }}
        <option value={value ?? label}>{label || value}</option>
      {/each}
    </datalist>
  {/if}
  <ErrorMessage {name} msg={errormsg} show={showerror} />
</div>
