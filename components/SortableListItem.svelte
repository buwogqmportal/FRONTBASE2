<script lang="ts">
  //svelte
  import { createEventDispatcher } from 'svelte';

  //components
  import SortableIcon from '$icons/sortable.svg?component';
  import CheckmarkIcon from '$icons/checkmark.svg?component';

  export let title = '';
  export let enabled = true;
  export let index = 0;

  const dispatch = createEventDispatcher();

  const handleDisabled = () => {
    enabled = !enabled;

    dispatch('disableChanged', { index: index, title: title, enabled: enabled });
  };

  export const isDisabled = (): boolean => {
    return enabled;
  };

  export const getTitle = (): string => {
    return title;
  };
</script>

<div
  class={[
    'rounded-lg shadow-md p-2.5 my-1 flex justify-between items-center cursor-pointer mx-1',
    [!enabled ? 'bg-secondary-lighter text-secondary-light' : 'bg-white text-secondary'],
  ].join(' ')}
  on:click={handleDisabled}
>
  <div class="flex flex-row justify-between items-center">
    <SortableIcon />
    <p class="ml-4 font-black">
      {title}
    </p>
  </div>
  <div class={['rounded-xl py-2 px-1.5', [!enabled ? 'bg-white ring-1 ring-secondary' : 'bg-primary']].join(' ')}>
    <CheckmarkIcon class="text-white" />
  </div>
</div>
