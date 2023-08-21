<script type="ts">
  import { browser } from '$app/env';

  import type { Shortcuts as ShortscutsType } from 'shortcuts';
  import { onMount, setContext } from 'svelte';
  import { writable } from 'svelte/store';

  let shortcuts = writable<ShortscutsType>(null);

  setContext('shortcuts', shortcuts);

  onMount(() => {
    if (!browser) return;

    import('shortcuts').then(({ Shortcuts }) => {
      $shortcuts = new Shortcuts();
    });

    return () => {
      $shortcuts?.reset();
    };
  });
</script>

<slot />
