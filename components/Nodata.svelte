<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  let class_ = '';
  export { class_ as class };
</script>

<div class={['h-100 flex flex-col flex-grow justify-center items-center space-y-4 py-12', class_].join(' ')}>
  {#if $$slots.title}
    <p class="text-secondary text-opacity-70 font-bold">
      <slot name="title" />
    </p>
  {/if}
  {#if $$slots.text}
    <p class=" text-secondary text-opacity-70 text-center">
      <slot name="text" />
    </p>
  {/if}
</div>
