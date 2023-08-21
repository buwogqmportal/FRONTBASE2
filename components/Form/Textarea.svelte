<script lang="ts">
  import { listToClass } from '$baselib/util';
  import { v4 as uuidv4 } from 'uuid';

  // svelte
  import { createEventDispatcher, onMount } from 'svelte';

  // components
  import ErrorMessage from './ErrorMessage.svelte';
  import { browser } from '$app/env';

  const dispatch = createEventDispatcher();

  export let id = uuidv4();

  export let placeholder = '';
  export let label = '';
  export let name = '';
  export let value = '';
  export let disabled = false;
  // Message to display, when an Error occurs. Doesn't show anything if the string is empty.
  export let errormsg = '';
  // Hide the error message, even if `errormsg` is set.
  export let showerror = true;

  let textareaEl: HTMLTextAreaElement;

  let class_ = '';
  export { class_ as class };
  export let textareaClass = '';

  export let minRows: number = 2;
  export let maxRows: number = Infinity;

  let rows = minRows;

  $: if (rows || minRows || maxRows) handleInput();

  function handleInput() {
    if (!browser || !textareaEl) return;
    const style = getComputedStyle(textareaEl);

    const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const borderY = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
    const lineHeight = parseFloat(style.lineHeight);

    textareaEl.style.height = 'auto';
    rows = Math.max(minRows, Math.min((textareaEl.scrollHeight - paddingY) / lineHeight, maxRows));
    textareaEl.style.height = rows * lineHeight + paddingY + borderY + 'px';

    // if we are at the bottom of the textarea and a newline is added, stay at the bottom
    // without this the text will be touching the bottom border
    // with this the bottom padding will seperate the text from the bottom border
    const offset = paddingY + lineHeight;
    const bottom = textareaEl.scrollHeight - textareaEl.scrollTop - textareaEl.offsetHeight + borderY;

    if (bottom < offset) {
      textareaEl.scrollTo({ top: textareaEl.scrollHeight });
    }

    dispatch('input', value);
  }

  onMount(() => {
    requestAnimationFrame(() => {
      handleInput();
    });
  });
</script>

<div class="w-100 {class_}">
  {#if label}
    <label class="c-label" for={id}>
      {label}
    </label>
  {/if}

  <div>
    <textarea
      rows="1"
      class={[
        'c-input resize-none',
        'overflow-y-auto',
        'leading-5',
        label && 's-label',
        showerror && errormsg && 's-error',
        textareaClass,
      ].reduce(listToClass)}
      {id}
      {name}
      placeholder={placeholder || label}
      bind:value
      bind:this={textareaEl}
      {disabled}
      on:change
      on:keypress
      on:input={handleInput}
    />
  </div>
  <ErrorMessage {name} msg={errormsg} show={showerror} />
</div>
