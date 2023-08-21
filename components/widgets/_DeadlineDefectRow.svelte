<script lang="ts">
  import DeadlineBadge from '$components/DeadlineBadge.svelte';
  import SkeletonText from '$components/SkeletonText.svelte';
  import { dateFormat } from '$baselib/formater';

  export let loading = false;
  export let loadingWidth: 'w-7/12' | 'w-8/12' | 'w-9/12' | 'w-10/12' = 'w-9/12';
  export let date: Date = undefined;

  let class_ = 'text-secondary/70';
  export { class_ as class };
</script>

<div
  class="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-4 xl:grid-cols-5 text-sym font-semibold items-center break-all truncate {class_}"
>
  <div class="col-span-2 sm:col-span-3 md:col-span-2 xl:col-span-3">
    {#if loading}
      <SkeletonText {loadingWidth} />
    {:else}
      <slot />
    {/if}
  </div>
  {#if date}
    <DeadlineBadge {date} />
    <div class="place-self-center">
      {$dateFormat.format(date)}
    </div>
  {:else if loading}
    <DeadlineBadge {loading} />
    <div class="place-self-center">
      <SkeletonText loadingWidth="w-24" />
    </div>
  {/if}
</div>
