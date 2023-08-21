<script lang="ts">
  import SkeletonText from '$components/SkeletonText.svelte';

  export let loading = false;
  export let loadingWidth: 'w-7/12' | 'w-8/12' | 'w-9/12' | 'w-10/12' = 'w-9/12';
  export let vertical = false;

  let class_ = ($$slots.header ? 'text-right ' : '') + 'mt-4';
  export { class_ as class };
</script>

<div
  class={[
    'flex',
    [vertical ? 'flex-col justify-start items-start' : 'flex-row justify-between items-center space-x-4'],
    [class_],
  ].join(' ')}
>
  {#if $$slots.header}
    <div class="font-bold">
      <slot name="header" />
    </div>
  {/if}

  {#if loading}
    <SkeletonText {loadingWidth} />
  {:else}
    <slot name="value" />
  {/if}
</div>
