<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // svelte
  import { createEventDispatcher } from 'svelte';

  // lib
  import { styleBackgroundColor } from '$baselib/util';

  import DownloadIcon from '$icons/download.svg?component';
  import EditIcon from '$icons/edit.svg?component';
  import FingerprintIcon from '$icons/fingerprint.svg?component';
  import MilestoneIcon from '$icons/milestone.svg?component';
  import RemovableIcon from '$icons/removable.svg?component';

  const dispatch = createEventDispatcher();

  export let id = '';
  export let title = '';
  export let type: string;
  export let typeID: string;
  export let color = '';

  export let inspect = false;

  let edit = !title;
  let input: HTMLElement;

  $: if (input) input.focus();
</script>

<div class="bg-secondary-darker text-white rounded-t-xl p-3" style={styleBackgroundColor(color)}>
  {#if edit && !inspect}
    <input
      class="w-full bg-white text-secondary p-1 placeholder:text-secondary-light"
      bind:this={input}
      bind:value={title}
      placeholder="Namen eingeben"
      on:blur={() => {
        if (edit && title === '') {
          dispatch('cancel', title);
        }
        edit = false;
      }}
      on:keydown|stopPropagation
      on:change={() => {
        edit = false;
        dispatch('title', title);
      }}
    />
  {:else}
    <div
      class="p-1"
      on:dblclick={() => {
        edit = true;
      }}
    >
      {title}
    </div>
  {/if}
</div>

<div class="grow flex flex-col p-1 transition">
  <div class="flex flex-row p-3 items-center">
    <MilestoneIcon />
    <div class="ml-3">
      {type} ({typeID})
    </div>
  </div>
  <div class="flex flex-row p-3 items-center">
    <FingerprintIcon />
    <div class="ml-3">
      {#if id}
        {$_('drawflow.node.id', { values: { id } })}
      {:else}
        {$_('drawflow.node.id_loading')}
      {/if}
    </div>
  </div>
</div>

{#if !inspect}
  <hr class="border-secondary-lighter selected-show" />

  <div class="flex flex-row p-1 selected-show">
    <button
      class="flex flex-col justify-center items-center p-3 flex-1 hover:bg-secondary-lighter transition rounded-bl-md"
      on:click={() => {
        dispatch('edit');
      }}
    >
      <EditIcon />
      <div>{$_('drawflow.node.edit')}</div>
    </button>
    <button
      class="flex flex-col justify-center items-center p-3 flex-1 hover:bg-secondary-lighter transition"
      on:click={() => {
        dispatch('copy');
      }}
    >
      <DownloadIcon />
      <div>{$_('drawflow.node.copy')}</div>
    </button>
    <button
      class="flex flex-col justify-center items-center p-3 flex-1 hover:bg-secondary-lighter transition rounded-br-md"
      on:click={() => {
        dispatch('remove');
      }}
    >
      <RemovableIcon />
      <div>{$_('drawflow.node.remove')}</div>
    </button>
  </div>
{/if}

{#if inspect}
  <hr class="border-secondary-lighter selected-show" />

  <div class="flex flex-row p-1 selected-show">
    <button
      class="flex flex-col justify-center items-center p-3 flex-1 hover:bg-secondary-lighter transition"
      on:click={() => {
        dispatch('logs');
      }}
    >
      <DownloadIcon />
      <div>Logs</div>
    </button>
  </div>
{/if}
