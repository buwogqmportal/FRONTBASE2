<script lang="ts">
  import { browser } from '$app/env';
  import { createEventDispatcher, onMount } from 'svelte';

  // node modules
  import { v4 as uuidv4 } from 'uuid';

  export let projectId: number;
  export let tools = null;
  export let appearence = null;
  export let locale: string = null;
  export let displayMode: 'email' | 'web' = null;
  export let initialLoad = true;

  //data received from the editor
  export let design: any = null;
  export let html: string = null;

  let editor = null;
  let id = uuidv4();

  const dispatch = createEventDispatcher();

  function init() {
    if (!editor) {
      console.log('create');
      editor = window['unlayer'].createEditor({
        id,
        displayMode,
        tools,
        appearence,
        locale,
        projectId,
      });
    }
  }

  $: if (editor) {
    editor.addEventListener('design:updated', function (data) {
      editor.exportHtml(function (data) {
        design = data.design;
        html = data.html;
      });
    });
  }

  onMount(() => {
    if (browser && window['unlayer']) {
      init();
    }
  });

  $: if (editor && design && initialLoad) {
    initialLoad = false;
    editor.loadDesign(design);
  }
</script>

<svelte:head>
  <script src="//editor.unlayer.com/embed.js" on:load={init}></script>
</svelte:head>

<div class="py-6 h-[720px] overflow-x-auto" {id} />

<div class="text-sm text-right">powered by <a target="blank" href="https://unlayer.com/embed">Unlayer</a></div>
