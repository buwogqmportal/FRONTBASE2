<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  let class_ = '';
  export { class_ as class };
</script>

<div class={['w-full flex flex-row gap-x-3 gap-y-4 flex-wrap', class_].join(' ')}>
  <slot />
</div>
