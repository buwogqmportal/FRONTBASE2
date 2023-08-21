<script lang="ts">
  // node modules
  import { v4 as uuidv4 } from 'uuid';

  // svelte
  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';

  // lib
  import { convertTo } from '$baselib/util';

  // components
  import type { FormErrorMessage } from '$components/Form.svelte';
  import ErrorMessage from './ErrorMessage.svelte';

  export let name = '';
  export let label = '';
  export let checked = false;
  export let theme: 'default' | 'light' | 'dark' = 'default';
  export let disabled = false;
  export let reverse = false;
  // Message to display, when an Error occurs. Doesn't show anything if the string is empty.
  export let errormsg = '';
  // Hide the error message, even if `errormsg` is set.
  export let showerror = true;

  let class_ = '';
  export { class_ as class };

  let id = uuidv4();

  const errorMessage = getContext<Writable<FormErrorMessage>>('formerrormessage');

  $: if (errorMessage && name) {
    errormsg = $errorMessage(name);
  }
</script>

<div class={class_}>
  <label
    class={[
      'text-sm flex flex-row',
      { default: 'text-secondary', light: 'text-secondary-muted', dark: 'text-white' }[theme],
    ].join(' ')}
    ><span class="mr-2 grow">{label}</span>
    <input
      type="checkbox"
      class="w-8 h-4 
        border-0 rounded-full 
        bg-secondary text-primary transition-colors 
        relative 
        focus:ring-primary 
        focus:ring-1
        checked:bg-none 
        after:absolute after:top-0.5 after:left-0.5 after:w-3 after:h-3 
        after:bg-white after:rounded-full after:transition-transform after:ease-[cubic-bezier(0.19, 1, 0.22, 1)]
        after:checked:translate-x-4"
      {disabled}
      bind:checked
      on:change
    />
  </label>
  <ErrorMessage {name} msg={errormsg} show={showerror} />
</div>

<input hidden {name} value={convertTo.api.boolean(checked)} tabindex="-1" aria-hidden="true" />
