<script lang="ts">
  //svelte
  import { createEventDispatcher } from 'svelte';

  //components
  import Button from '$components/Form/Button.svelte';

  const dispatch = createEventDispatcher();

  let class_ = '';
  export { class_ as class };

  export let cancelBtn = false;
  export let cancelBtnText = '';
  export let disabled = false;
  export let submit = false;

  export let successBtnText = 'Fertigstellen';
</script>

<div
  class={['flex flex-col-reverse space-y-4 space-y-reverse sm:flex-row sm:space-x-4 sm:space-y-0', [class_]].join(' ')}
>
  {#if cancelBtn}
    <div class="grow">
      <Button on:click={() => dispatch('cancel')} color="secondary">
        {cancelBtnText}
      </Button>
    </div>
  {/if}
  <div class="grow">
    <Button {submit} on:click={() => dispatch('success')} {disabled} color="primary">
      {successBtnText}
    </Button>
  </div>
</div>
