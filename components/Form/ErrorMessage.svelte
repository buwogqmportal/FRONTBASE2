<script lang="ts">
  import type { FormErrorMessage } from '$components/Form.svelte';

  import { getContext } from 'svelte';
  import type { Writable } from 'svelte/store';

  export let name = '';
  export let msg = '';
  export let show = true;

  const errorMessage = getContext<Writable<FormErrorMessage>>('formerrormessage');

  let form = '';

  $: if (errorMessage && name) {
    form = $errorMessage(name) ?? '';
  }
</script>

{#if show && (msg || form)}
  <span data-error />

  <slot name="error" msg={msg || form}>
    <p class="text-sm text-alert mt-3">
      {msg || form}
    </p>
  </slot>
{:else}
  <slot show />
{/if}
