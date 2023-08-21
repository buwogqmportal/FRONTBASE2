<!-- v1.1.0 -->
<script context="module" lang="ts">
  export function bind<Props extends Record<string, any> = any>(Component: typeof SvelteComponentTyped, props?: Props) {
    return function ModalComponent(options: any): SvelteComponentTyped<Props> {
      return new Component({
        ...options,
        props: {
          ...props,
          ...options.props,
        },
      });
    };
  }

  type TransitionCallback = (e: CustomEvent<null>) => void;

  export type ModalContext = {
    open: <Props, TransitionBGParams, TransitionWindowParams>(
      NewComponent: typeof SvelteComponent,
      newProps?: Props,
      options?: {
        props?: Props;
        title?: string;
        subtitle?: string;
        closeButton?: boolean;
        secondaryStyle?: boolean;
        closeOnEsc?: boolean;
        closeOnOuterClick?: boolean;
        classBg?: string;
        classWindowWrap?: string;
        classWindow?: string;
        classContent?: string;
        classCloseButton?: string;
        transitionBg?: (node: Element, params?: TransitionBGParams) => TransitionConfig;
        transitionBgProps?: TransitionBGParams;
        transitionWindow?: (node: Element, params?: TransitionWindowParams) => TransitionConfig;
        transitionWindowProps?: TransitionWindowParams;
        disableFocusTrap?: boolean;
      },
      callback?: {
        onOpen?: TransitionCallback;
        onClose?: TransitionCallback;
        onOpened?: TransitionCallback;
        onClosed?: TransitionCallback;
      },
    ) => void;
    close: (callback?: { onClose?: TransitionCallback; onClosed?: TransitionCallback }) => void;
    isOpen: () => boolean;
  };
</script>

<script lang="ts">
  import { fade, type TransitionConfig } from 'svelte/transition';
  import { createEventDispatcher, onDestroy, onMount, setContext, SvelteComponent, SvelteComponentTyped } from 'svelte';
  import CloseIcon from '$icons/close.svg?component';
  import CardDivider from '$components/Card/CardDivider.svelte';

  const dispatch = createEventDispatcher();

  export let show = null;

  export let key = 'simple-modal';
  export let title = '';
  export let subtitle = '';
  export let secondaryStyle = false;
  export let closeButton = true;
  export let closeOnEsc = true;
  export let closeOnOuterClick = true;
  export let classBg = '';
  export let classWindowWrap = '';
  export let classWindow = '';
  export let classContent = '';
  export let classCloseButton = '';
  export let transitionBg = fade;
  export let transitionBgProps = { duration: 250 };
  export let transitionWindow = transitionBg;
  export let transitionWindowProps = transitionBgProps;
  export let disableFocusTrap = false;

  const defaultState = {
    title,
    subtitle,
    closeButton,
    secondaryStyle,
    closeOnEsc,
    closeOnOuterClick,
    classBg,
    classWindowWrap,
    classWindow,
    classContent,
    classCloseButton,
    transitionBg,
    transitionBgProps,
    transitionWindow,
    transitionWindowProps,
    disableFocusTrap,
  };
  let state = { ...defaultState };

  let Component: typeof SvelteComponentTyped = null;

  let background: HTMLElement;
  let wrap: HTMLElement;
  let modalWindow: HTMLElement;
  let scrollY: number;
  let cssBg: string;
  let currentTransitionBg: (node: HTMLElement, params: any) => TransitionConfig;
  let currentTransitionWindow: (node: HTMLElement, params: any) => TransitionConfig;
  let prevBodyPosition: string;
  let prevBodyOverflow: string;
  let prevBodyWidth: string;
  let outerClickTarget: any;

  const camelCaseToDash = (str: string) => str.replace(/([a-zA-Z])(?=[A-Z])/g, '$1-').toLowerCase();

  const toCssString = (props: Record<string, string | number | boolean>) =>
    props ? Object.keys(props).reduce((str, key) => `${str}; ${camelCaseToDash(key)}: ${props[key]}`, '') : '';

  const isFunction = (f: any): f is Function => !!(f && f.constructor && f.call && f.apply);

  const updateStyleTransition = () => {
    cssBg = toCssString({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    currentTransitionBg = state.transitionBg;
    currentTransitionWindow = state.transitionWindow;
  };

  const toVoid = () => {};
  let onOpen: TransitionCallback = toVoid;
  let onClose: TransitionCallback = toVoid;
  let onOpened: TransitionCallback = toVoid;
  let onClosed: TransitionCallback = toVoid;

  const open = (
    NewComponent: typeof SvelteComponentTyped,
    newProps: any = {},
    options: any = {},
    callback: {
      onOpen?: TransitionCallback;
      onClose?: TransitionCallback;
      onOpened?: TransitionCallback;
      onClosed?: TransitionCallback;
    } = {},
  ) => {
    // @ts-ignore
    Component = bind(NewComponent, newProps);
    state = { ...defaultState, ...options };
    updateStyleTransition();
    disableScroll();
    onOpen = (event) => {
      if (callback.onOpen) callback.onOpen(event);
      dispatch('open');
      dispatch('opening'); // Deprecated. Do not use!
    };
    onClose = (event) => {
      if (callback.onClose) callback.onClose(event);
      dispatch('close');
      dispatch('closing'); // Deprecated. Do not use!
    };
    onOpened = (event) => {
      if (callback.onOpened) callback.onOpened(event);
      dispatch('opened');
    };
    onClosed = (event) => {
      if (callback.onClosed) callback.onClosed(event);
      dispatch('closed');
    };
  };

  const close = (callback: { onClose?: TransitionCallback; onClosed?: TransitionCallback } = {}) => {
    if (!Component) return;
    onClose = callback.onClose || onClose;
    onClosed = callback.onClosed || onClosed;
    Component = null;
    enableScroll();
  };

  const isOpen = () => Boolean(Component);

  const handleKeydown = (event: KeyboardEvent) => {
    if (state.closeOnEsc && Component && event.key === 'Escape') {
      event.preventDefault();
      close();
    }

    if (Component && event.key === 'Tab' && !state.disableFocusTrap) {
      // trap focus
      const nodes = modalWindow.querySelectorAll<HTMLElement>('*');
      const tabbable = Array.from(nodes).filter((node) => node.tabIndex >= 0);

      let index = tabbable.indexOf(document.activeElement as HTMLElement);
      if (index === -1 && event.shiftKey) index = 0;

      index += tabbable.length + (event.shiftKey ? -1 : 1);
      index %= tabbable.length;

      tabbable[index].focus();
      event.preventDefault();
    }
  };

  const handleOuterMousedown = (event: MouseEvent) => {
    if (state.closeOnOuterClick && (event.target === background || event.target === wrap))
      outerClickTarget = event.target;
  };

  const handleOuterMouseup = (event: MouseEvent) => {
    if (state.closeOnOuterClick && event.target === outerClickTarget) {
      event.preventDefault();
      close();
    }
  };

  const disableScroll = () => {
    scrollY = window.scrollY;
    prevBodyPosition = document.body.style.position;
    prevBodyOverflow = document.body.style.overflow;
    prevBodyWidth = document.body.style.width;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.overflow = 'hidden';
    document.body.style.width = '100%';
  };

  const enableScroll = () => {
    document.body.style.position = prevBodyPosition || '';
    document.body.style.top = '';
    document.body.style.overflow = prevBodyOverflow || '';
    document.body.style.width = prevBodyWidth || '';
    window.scrollTo(0, scrollY);
  };

  setContext(key, { open, close, isOpen });

  let isMounted = false;

  $: {
    if (isMounted) {
      if (isFunction(show)) {
        open(show);
      } else {
        close();
      }
    }
  }

  onDestroy(() => {
    if (isMounted) close();
  });

  onMount(() => {
    isMounted = true;
  });
</script>

<svelte:window on:keydown={handleKeydown} />

<slot />

{#if Component}
  <div
    class="c-modal-bg {state.classBg}"
    on:mousedown={handleOuterMousedown}
    on:mouseup={handleOuterMouseup}
    bind:this={background}
    transition:currentTransitionBg={state.transitionBgProps}
    style={cssBg}
  >
    <div class="c-modal-window-wrap {state.classWindowWrap}" bind:this={wrap}>
      <div
        class="c-modal-window {state.classWindow}"
        role="dialog"
        aria-modal="true"
        bind:this={modalWindow}
        transition:currentTransitionWindow={state.transitionWindowProps}
        on:introstart={onOpen}
        on:outrostart={onClose}
        on:introend={onOpened}
        on:outroend={onClosed}
      >
        {#if state.title || state.subtitle || state.closeButton}
          {#if state.secondaryStyle}
            <div class="flex shrink-0 flex-col pt-6 px-6 bg-secondary text-white">
              <div class="flex flex-row mb-6">
                <h4 class="font-black text-lg leading-6 grow">{state.title}</h4>
                {#if state.closeButton}
                  {#if isFunction(state.closeButton)}
                    <svelte:component this={state.closeButton} onClose={close} />
                  {:else}
                    <button on:click={() => close()} class="c-modal-close-button {state.classCloseButton}"
                      ><CloseIcon class="w-4 h-4" /></button
                    >
                  {/if}
                {/if}
              </div>
              {#if state.subtitle !== ''}
                <p class="mt-4">{state.subtitle}</p>
              {/if}
            </div>
          {:else}
            <div class="flex shrink-0 flex-col pt-6 px-6">
              <div class="flex flex-row mb-6">
                <h4 class="font-black text-lg leading-6 grow">{state.title}</h4>
                {#if state.closeButton}
                  {#if isFunction(state.closeButton)}
                    <svelte:component this={state.closeButton} onClose={close} />
                  {:else}
                    <button on:click={() => close()} class="c-modal-close-button {state.classCloseButton}"
                      ><CloseIcon /></button
                    >
                  {/if}
                {/if}
              </div>
              <CardDivider class="my-0" />
              {#if state.subtitle !== ''}
                <p class="mt-4">{state.subtitle}</p>
              {/if}
            </div>
          {/if}
        {/if}
        <div class="c-modal-content {state.classContent}">
          <svelte:component this={Component} />
        </div>
      </div>
    </div>
  </div>
{/if}
