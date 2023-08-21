<script lang="ts">
  import { focus } from '$baselib/util';
  import ArrowIcon from '$icons/arrow.svg?component';
  import CloseIcon from '$icons/close.svg?component';
  import { createEventDispatcher } from 'svelte';
  import Shortcut from '$components/Shortcut.svelte';

  type T = $$Generic;

  export let search: (value: string) => T[];
  export let show = false;
  export let value = '';
  export let result: T = null;
  export let index = 0;
  let results: T[] = [];

  const dispatch = createEventDispatcher();

  function handleOpen(e: KeyboardEvent) {
    const detail = { prevent: false };
    dispatch('open', detail);
    if (!detail.prevent) {
      e.preventDefault();
      show = true;
    }
  }

  function handleClose() {
    clear();
  }

  function clear() {
    show = false;
    value = '';
    results = [];
    result = null;
    index = 0;
    dispatch('close');
  }

  function handleSearch(e: Event) {
    clear();
    show = true;

    const v = (e.target as HTMLInputElement).value.trim();
    if (!v || v === value) return;
    value = v;

    results = search(value);

    index = 0;
    result = results[index];

    dispatch('search', value);
    dispatch('select', { index, value, result });
  }

  function next() {
    index++;
    if (index >= results.length) index = index - results.length;
    result = results[index];
    dispatch('next', { index, value, result });
    dispatch('select', { index, value, result });
  }

  function prev() {
    index--;
    if (index < 0) index = results.length + index;
    result = results[index];
    dispatch('prev', { index, value, result });
    dispatch('select', { index, value, result });
  }
</script>

{#if show}
  <Shortcut shortcut="Enter" onTrigger={next} />
  <Shortcut shortcut="Escape" onTrigger={handleClose} />
  <div class="absolute z-30 top-6 right-6 flex flex-row space-x-2 items-center bg-white p-2 rounded-lg shadow-lg">
    <input type="text" class="border-0 p-0" on:input={handleSearch} use:focus />
    <span>
      {Math.min(results.length, index + 1)} / {results.length}
    </span>
    <button class="w-8 h-8" on:click={prev}><ArrowIcon class="rotate-90 mx-auto" /></button>
    <button class="w-8 h-8" on:click={next}><ArrowIcon class="-rotate-90 mx-auto" /></button>
    <button class="w-8 h-8" on:click={clear}><CloseIcon class="mx-auto" /></button>
  </div>
{:else}
  <Shortcut shortcut="Alt+F" onTrigger={handleOpen} />
{/if}
