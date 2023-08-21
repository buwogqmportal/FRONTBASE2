<script context="module" lang="ts">
  export type SelectFunctionalOption = { value?: string; label?: string; callback?: () => void };
</script>

<script lang="ts">
  import ArrowFilledDown from '$icons/arrow_filled_down.svg?component';
  import ArrowFilledTop from '$icons/arrow_filled_top.svg?component';
  import { onMount } from 'svelte';

  export let label = '';
  export let value = '';
  export let options: SelectFunctionalOption[] = [];
  export let disabled = false;

  let class_ = '';
  export { class_ as class };

  let showOptions = false;

  let activeOption: SelectFunctionalOption;

  onMount(() => {
    activeOption = options[0];
  });

  function handleOptionClick(option: SelectFunctionalOption) {
    activeOption = option;
    value = option.value;
    label = option.label;
    showOptions = false;
  }

  const callOnSuccess = () => {
    activeOption.callback();
  };
</script>

<div
  class={[
    'flex flex-col justify-end items-center relative max-h-12',
    showOptions ? 'rounded-t-lg rounded-b-none' : 'rounded-lg',
    disabled ? 'border bg-secondary-light border-secondary text-secondary-muted' : 'bg-primary text-white ',
    class_,
  ].join(' ')}
>
  <div class="w-full h-full flex flex-row items-center justify-between">
    <button {disabled} class="m-3 {showOptions ? 'rounded-t-lg' : 'rounded-lg'} " on:click={() => callOnSuccess()}
      >{label !== '' ? label : options[0].label}</button
    >
    {#if options.length > 1}
      <span
        class=" flex flex-row items-center justify-center w-6 h-full my-3 absolute right-0 cursor-pointer {showOptions
          ? 'rounded-tr-lg'
          : 'rounded-r-lg'}
        {disabled ? 'bg-secondary-light text-secondary-muted border-l border-secondary' : 'bg-primary-dark'}"
        on:click={() => (!disabled ? (showOptions = !showOptions) : (showOptions = false))}
        >{#if showOptions}<ArrowFilledTop />{:else}<ArrowFilledDown />{/if}</span
      >
    {/if}
  </div>
  {#if options.length > 1}
    <div
      class={[
        'bg-white w-full rounded-b-lg absolute top-12 z-50',
        showOptions ? 'flex border border-primary' : 'hidden',
      ].join(' ')}
    >
      <ul class="rounded-b-lg w-full">
        {#if options && activeOption}
          {#each options.filter((option) => option.value !== activeOption.value) as option}
            <div
              class="w-full text-secondary-muted p-3 cursor-pointer border-t border-secondary-lighter"
              on:click={() => handleOptionClick(option)}
            >
              <option value={option.value}>{option.label}</option>
            </div>
          {/each}
        {/if}
      </ul>
    </div>
  {/if}
</div>
