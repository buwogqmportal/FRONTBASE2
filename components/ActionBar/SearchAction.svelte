<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // components
  import SearchIcon from '$icons/search.svg?component';

  export let search = '';
  export let placeholder = $_('components.search.placeholder');
  export let disabled = false;

  let class_ = '';
  export { class_ as class };
</script>

<div class="flex-grow relative text-secondary text-opacity-70 focus-within:text-opacity-100 {class_}">
  <input class="h-12 pl-12 c-input bg-white border-none" type="search" {placeholder} {disabled} bind:value={search} />
  <div class={['absolute left-0 top-0 bottom-0 h-12 w-12 flex items-center justify-center rounded-2'].join(' ')}>
    <SearchIcon />
  </div>
</div>
