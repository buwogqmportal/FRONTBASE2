<script lang="ts">
  import SkeletonText from '$components/SkeletonText.svelte';

  import ToolsIcon from '$icons/tools.svg?component';

  export let loading = false;
  export let loadingWidth: 'w-7/12' | 'w-8/12' | 'w-9/12' | 'w-10/12' = 'w-9/12';
  export let showIcon = true;

  let class_ = 'text-secondary/70';
  export { class_ as class };
</script>

<div class="flex flex-row items-center mt-4 text-sym font-semibold break-all {class_}">
  {#if showIcon}
    <slot name="icon">
      <ToolsIcon />
    </slot>
  {/if}
  <div class={['flex-grow', [showIcon ? 'ml-4' : '']].join(' ')}>
    {#if loading}
      <SkeletonText {loadingWidth} />
    {:else}
      <slot />
    {/if}
  </div>
</div>
