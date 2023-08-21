<script lang="ts">
  import type { Shortcuts } from 'shortcuts';
  import { getContext, onMount } from 'svelte';
  import type { Writable } from 'svelte/store';

  const shortcuts = getContext<Writable<Shortcuts>>('shortcuts');

  export let shortcut: string;
  export let bubble = false;
  export let onTrigger = (_ev: KeyboardEvent) => {};

  let last: string;

  function handler(ev: KeyboardEvent): boolean {
    onTrigger(ev);
    return !bubble;
  }

  onMount(() => {
    return () => {
      if ($shortcuts && last) $shortcuts.remove({ shortcut: last, handler });
    };
  });

  if ($shortcuts) {
    change(shortcut);
  }

  function change(shortcut: string) {
    if (last) $shortcuts.remove({ shortcut: last, handler });
    last = shortcut;
    $shortcuts.add({ shortcut: last, handler });
  }
</script>
