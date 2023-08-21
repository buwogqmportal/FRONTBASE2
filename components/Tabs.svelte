<script lang="ts" context="module">
  export type TabName = {
    name: string;
    hidden?: boolean;
    badge?: string | number;
    siblings?: number[];
  };
</script>

<script lang="ts">
  import { listToClass } from '$baselib/util';
  import { createEventDispatcher } from 'svelte';
  import Badge from './Badge.svelte';

  export let selected = 0;
  export let tabs: (TabName | string)[];

  let class_ = '';
  export { class_ as class };

  const dispatch = createEventDispatcher();
</script>

<div class="c-tabs {class_}">
  {#each tabs.map((name) => (typeof name === 'string' ? { name } : name)) as { name, badge, hidden, siblings = [] }, i}
    {#if !hidden}
      <button
        class={[
          'c-tabs-item leading-5',
          (selected === i || siblings.some((sibling) => sibling === selected)) && 's-selected',
        ].reduce(listToClass)}
        on:click={() => {
          selected = i;
          dispatch('change', i);
        }}
      >
        {name}
        {#if badge}
          <Badge type="tiny" class="ml-1 p-1.5 h-5 bg-alert text-white">{badge}</Badge>
        {/if}
      </button>
    {/if}
  {/each}
</div>
