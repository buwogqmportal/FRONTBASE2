<script lang="ts">
  import { listToClass } from '$baselib/util';

  export let loadingWidth = 'w-9/12';
  export let height = 'h-6';
  export let random = false;
  export let inline = false;

  function select<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }
</script>

<div
  class={[
    random ? select(['w-7/12', 'w-8/12', 'w-9/12', 'w-10/12']) : loadingWidth,
    height,
    inline ? 'inline-block' : 'flex items-center',
    'animate-pulse',
  ].reduce(listToClass)}
>
  <span
    class={[inline && 'inline-block align-text-bottom', 'w-full h-[1em] bg-current opacity-50 rounded'].reduce(
      listToClass,
    )}
  />
</div>
