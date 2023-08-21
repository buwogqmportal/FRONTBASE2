<script lang="ts">
  import { browser } from '$app/env';

  // lib
  import {
    _backLink,
    _contentClass,
    _hideFooter,
    _screenFull,
    _showBtn,
    _showCancelBtn,
    _showHeader,
    _showMenuBtn,
    _slimMenu,
    _title,
  } from '$baselib/stores';

  // svelte
  import { onDestroy, onMount } from 'svelte';

  export let backLink = '';
  export let contentClass = 'justify-start';
  export let screenFull = false;
  export let freeScroll = false;
  export let slimMenu = false;
  export let showBtn = '';
  export let showCancelBtn = false;
  export let showHeader = true;
  export let showMenuBtn = true;
  export let hideFooter = false;
  export let title = '';

  onMount(() => {
    if (browser) document.body.parentElement.style.overscrollBehaviorX = freeScroll ? 'none' : '';
  });

  onDestroy(() => {
    $_backLink = '';
    $_contentClass = 'justify-start';
    $_screenFull = false;
    $_slimMenu = false;
    $_showBtn = '';
    $_showCancelBtn = false;
    $_showHeader = true;
    $_showMenuBtn = true;
    $_hideFooter = false;
    $_title = '';

    if (browser) document.body.parentElement.style.overscrollBehaviorX = '';
  });

  $: $_backLink = backLink;
  $: $_contentClass = contentClass;
  $: $_screenFull = screenFull;
  $: $_slimMenu = slimMenu;
  $: $_showBtn = showBtn;
  $: $_showCancelBtn = showCancelBtn;
  $: $_showHeader = showHeader;
  $: $_showMenuBtn = showMenuBtn;
  $: $_hideFooter = hideFooter;
  $: $_title = title;
</script>
