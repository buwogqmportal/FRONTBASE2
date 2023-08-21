<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // svelte
  import { createEventDispatcher } from 'svelte';

  // components
  import SearchIcon from '$icons/search.svg?component';
  import FilterIcon from '$icons/filter.svg?component';
  import AddIcon from '$icons/add.svg?component';
  import SettingsIcon from '$icons/settings.svg?component';

  export let search = '';
  export let placeholder = $_('components.search.placeholder');
  export let hideFilter = false;
  export let showCreate = false;
  export let showSettings = false;
  export let disabled = false;
  export let filterIsActive = false;
  export let filterMobileIsActive = undefined;

  let class_ = '';
  export { class_ as class };

  const dispatch = createEventDispatcher();

  function handleFilter() {
    dispatch('filter');
  }

  function handleCreate() {
    dispatch('create');
  }

  function handleSettings() {
    dispatch('settings');
  }
</script>

<div class={['w-full flex flex-row space-x-3', class_].join(' ')}>
  <div class="flex-grow relative text-secondary text-opacity-70 focus-within:text-opacity-100">
    <input class="h-12 pl-12 c-input bg-white " type="search" {placeholder} {disabled} bind:value={search} />
    <div class={['absolute left-0 top-0 bottom-0 h-12 w-12 flex items-center justify-center rounded-2'].join(' ')}>
      <SearchIcon />
    </div>
  </div>
  {#if !hideFilter}
    <button
      class={[
        'h-12 w-12 shrink-0 flex items-center justify-center c-input bg-white',
        filterIsActive ? 'md:text-primary' : 'md:text-secondary/70',
        filterMobileIsActive ?? filterIsActive ? 'text-primary' : 'text-secondary/70',
      ].join(' ')}
      on:click={handleFilter}
    >
      <FilterIcon />
    </button>
  {/if}
  {#if showCreate}
    <button
      class="h-12 w-12 shrink-0 flex items-center justify-center rounded-lg text-secondary/70 bg-white focus:outline-none focus:ring-2 focus:ring-primary]"
      on:click={handleCreate}
    >
      <AddIcon />
    </button>
  {/if}
  {#if showSettings}
    <button
      class="h-12 w-12 shrink-0 flex items-center justify-center rounded-lg text-secondary/70 bg-white focus:outline-none focus:ring-2 focus:ring-primary]"
      on:click={handleSettings}
    >
      <SettingsIcon />
    </button>
  {/if}
</div>
