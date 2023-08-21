<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // components
  import { selectOptionLabel, selectOptionValue, type SelectOption } from '$components/Form/Select.svelte';

  export let options: SelectOption[];
  export let value = '';
  export let placeholder = $_('components.sort_action.placeholder');
  export let disabled = false;

  let class_ = '';
  export { class_ as class };
</script>

<div class="flex-grow relative text-secondary text-opacity-70 focus-within:text-opacity-100 {class_}">
  <select class="h-12 c-input bg-white" {disabled} bind:value on:change>
    <option value="">{placeholder}</option>

    {#each options as option}
      <option value={selectOptionValue(option)}>{selectOptionLabel(option)}</option>
    {/each}
  </select>
</div>
