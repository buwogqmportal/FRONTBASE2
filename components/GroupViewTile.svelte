<script lang="ts">
  import { listToClass } from '$baselib/util';

  import Image from './Image.svelte';

  export let image = '';
  export let title = '';
  export let subtitle = '';
  export let extra = '';
  export let active = false;
  export let slim = false;
</script>

<button
  class={[
    'w-full flex flex-row justify-between items-center px-6 space-x-2 transition-colors hover:bg-secondary-lighter/50 text-left',
    slim ? 'py-2' : 'py-4',
    active && 'bg-secondary-lighter',
  ].reduce(listToClass)}
  on:click
>
  <slot name="image">
    {#if image}
      <div class="w-16 h-16 object-cover">
        <Image id={image} />
      </div>
    {/if}
  </slot>
  <div class="grow relative flex flex-col items-start">
    <p class={['text-base font-black w-full', active && 'text-primary'].reduce(listToClass)}>
      {#if extra}
        <span class="float-right ml-1 mb-1 text-secondary/70 text-xs font-semibold leading-6">{extra}</span>
      {/if}
      {title}
    </p>

    {#if subtitle}
      <p class="text-xs">{subtitle}</p>
    {/if}
  </div>
</button>
