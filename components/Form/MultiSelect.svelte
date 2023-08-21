<script lang="ts" context="module">
  const getID = idGenerator('multiselect');
</script>

<script lang="ts">
  import RemovableIcon from '$icons/removable.svg?component';

  //Code Example
  //https://svelte.dev/repl/c7094fb1004b440482d2a88f4d1d7ef5?version=3.14.0

  import { createEventDispatcher, getContext, onDestroy, onMount } from 'svelte';
  import type { MultiSelectPopupContext } from '$components/Modal/MultiSelectPopup.svelte';
  import { focus, idGenerator, listToClass } from '$baselib/util';
  import { selectOptionLabel, selectOptionValue, type SelectOption } from './Select.svelte';
  import ErrorMessage from './ErrorMessage.svelte';

  const popup = getContext<MultiSelectPopupContext>('multi-select-popup');

  const id = getID();

  export let white = false;
  export let placeholder = '';
  export let label = '';
  export let name = '';
  export let value = [];
  export let options: SelectOption[] = [];
  export let disabled = false;
  // Message to display, when an Error occurs. Doesn't show anything if the string is empty.
  export let errormsg = '';
  // Hide the error message, even if `errormsg` is set.
  export let showerror = true;

  let class_ = '';
  export { class_ as class };
  export let selectClass = '';
  export let labelClass = '';

  let container: HTMLElement,
    input: HTMLInputElement,
    inputValue: string,
    filtered: SelectOption[] = [],
    activeOption: SelectOption,
    showOptions = false,
    selected: Record<string, SelectOption> = {},
    skipUpdate = false,
    focused = false;

  const dispatch = createEventDispatcher();

  $: if (value && !skipUpdate) {
    readOptions();
    skipUpdate = false;
  }

  onMount(() => {
    readOptions();
  });

  onDestroy(() => {
    popup.close();
  });

  $: if ((activeOption && !filtered.includes(activeOption)) || (!activeOption && inputValue))
    activeOption = filtered[0];

  function readOptions() {
    if (value) {
      selected = options.reduce<Record<string, SelectOption>>(
        (obj, op) => (value.includes(op.value) ? { ...obj, [op.value]: op } : obj),
        {},
      );
    } else {
      selected = {};
    }

    if (showOptions) {
      filterOptions(inputValue);
    }
  }

  function updateOptions() {
    skipUpdate = true;
    value = Object.values(selected).map((o) => o.value);

    if (showOptions) {
      popup.updateOptions(
        container,
        filtered.map((o) => ({ ...o, disabled: Boolean(selected[o.value]) })),
      );
    }
  }

  function filterOptions(search: string) {
    if (search) {
      filtered = options.filter((o) => selectOptionLabel(o).toLowerCase().includes(search.toLowerCase()));
    } else {
      filtered = options.slice();
    }
    updateOptions();
  }

  function add(token: SelectOption) {
    if (!disabled) {
      selected[token.value] = token;

      updateOptions();
      dispatch('change', value);
    }
  }

  function remove(tvalue: string) {
    if (!disabled) {
      const { [tvalue]: val, ...rest } = selected;
      selected = rest;

      updateOptions();
      dispatch('change', value);
    }
  }

  export function removeAll() {
    if (!disabled) {
      selected = {};
      inputValue = '';

      updateOptions();
      dispatch('change', value);
    }
  }

  function optionsVisibility(show: boolean) {
    if (disabled) return;

    if (show) {
      showOptions = true;
      readOptions();
      popup.open(
        container,
        filtered.map((o) => ({ ...o, disabled: Boolean(selected[o.value]) })),
        handleOptionClick,
      );
      inputValue = '';
      dispatch('showOptions');
    } else {
      showOptions = false;
      popup.close();
      activeOption = undefined;
      dispatch('closeOptions');
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.code === 'Enter') {
      popup.select();
      inputValue = '';
    }

    if (e.code === 'ArrowUp') {
      popup.moveUp();
    }

    if (e.code === 'ArrowDown') {
      popup.moveDown();
    }

    if (e.code === 'Escape') {
      e.stopPropagation();
      optionsVisibility(false);
    }

    if (e.code === 'Backspace' && inputValue === '') {
      const selectedList = Object.values(selected);
      remove(selectedList[selectedList.length - 1].value);
    }
  }

  function handleFocus(ev: FocusEvent) {
    focused = true;
  }

  function handleBlur(ev: FocusEvent) {
    if (!ev.relatedTarget || !(ev.relatedTarget as HTMLElement).closest('[data-multi-select-popup]')) {
      optionsVisibility(false);
    }

    focused = false;
  }

  function handleTokenClick(e: MouseEvent) {
    input.focus();

    const target = e.target as HTMLElement;
    if (target.closest('.token-remove')) {
      e.stopPropagation();
      remove((target.closest('.token') as HTMLElement).dataset.id);
    } else {
      optionsVisibility(true);
    }
  }

  function handleOptionClick(option: SelectOption) {
    if (selected[option.value]) {
      remove(option.value);
    } else {
      add(options.filter((o) => o.value === option.value)[0]);
      input.focus();
    }
  }
</script>

<svelte:window on:blur={() => optionsVisibility(false)} />

<div class={['relative', class_].join(' ')}>
  {#if label}
    <label for={id} class="c-label mb-3 {labelClass}">
      {label}
    </label>
  {/if}

  <ul
    class={[
      'c-multiselect',
      selectClass,
      focused && 's-focus',
      white && 'bg-white',
      showerror && errormsg && 's-error',
    ].reduce(listToClass)}
    class:showOptions
    bind:this={container}
    on:click={handleTokenClick}
  >
    {#each Object.values(selected) as s}<li
        class={['token c-multiselect-badge', disabled && 's-disabled'].reduce(listToClass)}
        data-id={selectOptionValue(s)}
      >
        <span>{selectOptionLabel(s)}</span>
        {#if !disabled}
          <button class="token-remove c-multiselect-remove-button" title="Remove {selectOptionLabel(s)}">
            <RemovableIcon />
          </button>
        {/if}
      </li>
    {/each}
    {#if !disabled}
      <input
        {id}
        class="c-multiselect-input"
        {placeholder}
        autocomplete="off"
        role="combobox"
        aria-expanded={showOptions}
        aria-controls={popup.id}
        bind:value={inputValue}
        bind:this={input}
        use:focus={showOptions}
        on:keydown={handleKeydown}
        on:focus={handleFocus}
        on:blur={handleBlur}
        on:input={() => filterOptions(inputValue)}
      />
    {/if}
  </ul>

  <ErrorMessage {name} msg={errormsg} show={showerror} />
</div>

<input {name} value={value.join(',')} hidden />
