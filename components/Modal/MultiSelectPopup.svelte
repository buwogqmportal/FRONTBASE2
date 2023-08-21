<script context="module" lang="ts">
  import { idGenerator } from '$baselib/util';

  import { selectOptionLabel, type SelectOption } from '$components/Form/Select.svelte';

  // TODO: move disabled into SelectOption, since option html elements can be disabled
  export type PopupOption = SelectOption & { disabled: boolean };
  export type MultiSelectPopupContext = {
    open(parentElement: HTMLElement, options: PopupOption[], selectCallback: (option: PopupOption) => void): void;
    close(): void;
    updateOptions(parentElement: HTMLElement, options: PopupOption[]): void;
    moveUp(): void;
    moveDown(): void;
    select(): void;
    isOpen(): boolean;
    id: string;
  };

  const getID = idGenerator('multiselect-popup');
</script>

<script lang="ts">
  // Svelte
  import { setContext } from 'svelte';
  import { fly } from 'svelte/transition';

  const id = getID();

  let c_parentElement: HTMLElement;
  let c_options: PopupOption[];
  let c_selectCallback: (option: PopupOption) => void;

  let left = 0;
  let width = 0;
  let top = 0;
  let bottom = 0;

  let reverse = false;

  let suggestions: HTMLElement;
  let selected = 0;

  let style = '';

  function open(parentElement: HTMLElement, options: PopupOption[], selectCallback: (option: PopupOption) => void) {
    c_options = options;
    c_selectCallback = selectCallback;

    selected = 0;
    move(0);
    style = '';

    reverse = false;
    update(parentElement);
  }

  function close() {
    c_parentElement = undefined;
    c_options = undefined;
    c_selectCallback = undefined;
  }

  function updateOptions(parentElement: HTMLElement, options: PopupOption[]) {
    if (!c_options) return;

    c_parentElement = parentElement;

    c_options = options;
    selected = 0;
    move(0);

    requestAnimationFrame(() => {
      update();
    });
  }

  function move(v: number) {
    if (c_options.length <= 1) return;

    let max = c_options.length;

    do {
      selected = (c_options.length + selected + v) % c_options.length;
      v = Math.sign(v) || 1;
      max--;
    } while (c_options[selected].disabled && max > 0);

    if (max === 0) {
      selected = -1;
    }
  }

  function select() {
    c_selectCallback(c_options[selected]);
  }

  setContext('multi-select-popup', {
    open,
    close,
    updateOptions,
    moveUp: () => move(-1),
    moveDown: () => move(1),
    select,
    id,
  });

  function updateParent(parentElement: HTMLElement) {
    c_parentElement = parentElement;

    const box = parentElement.getBoundingClientRect();

    left = box.left;
    width = box.width;
    bottom = box.bottom;
    top = box.top;
  }

  function alignSuggestions(): Promise<void> {
    return new Promise((res) => {
      (function _alignSuggestions() {
        if (!suggestions) {
          requestAnimationFrame(_alignSuggestions);
          return;
        }

        const box = suggestions.getBoundingClientRect();

        const isReverseBigger = top > window.innerHeight - bottom + 100;
        if (isReverseBigger && box.height > window.innerHeight - bottom) reverse = true;

        res();
      })();
    });
  }

  function updateStyle() {
    const props = [`left: ${left}px`, `width: ${width}px`];

    if (reverse) {
      props.push(`bottom: ${window.innerHeight - top}px`, `max-height: ${top}px`);
    } else {
      props.push(`top: ${bottom}px`, `max-height: ${window.innerHeight - bottom}px`);
    }

    style = props.join(';');
  }

  async function update(parentElement: HTMLElement = c_parentElement) {
    updateParent(parentElement);

    await alignSuggestions();

    updateStyle();
  }

  function scrollIntoView(node: HTMLElement, parameters = true) {
    if (parameters) {
      node.scrollIntoView();
    }

    return {
      update: (parameters: boolean) => {
        if (parameters) {
          node.scrollIntoView({
            block: 'center',
          });
        }
      },
    };
  }

  function handleScroll(ev: Event) {
    if ((ev.target as HTMLElement).id === id) close();
  }
</script>

<svelte:body on:scroll={handleScroll} />

<slot />

{#if c_options}
  <ul
    {id}
    class="c-multiselect-popup"
    class:rounded-b-lg={!reverse}
    class:rounded-t-lg={reverse}
    {style}
    data-multi-select-popup
    role="listbox"
    bind:this={suggestions}
    transition:fly={{ duration: 200, y: 5 }}
  >
    {#each c_options as option, i}
      <button
        class="c-multiselect-popup-option"
        class:text-primary={selected === i}
        disabled={option.disabled}
        role="option"
        use:scrollIntoView={selected === i}
        on:click={() => c_selectCallback(option)}
      >
        {selectOptionLabel(option)}
      </button>
    {/each}
  </ul>
{/if}
