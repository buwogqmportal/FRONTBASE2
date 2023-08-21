<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // components
  import Shadow from 'svelte-loading-spinners/dist/ts/Shadow.svelte';

  let class_ = '';
  export { class_ as class };

  export let value = $_('query.loading');
</script>

<div class="c-card c-card-container flex flex-col flex-grow justify-center items-center {class_}">
  <div class="p-3 text-primary">
    <Shadow size="30" duration="2.5s" />
  </div>
  <div class="mt-4">
    <p>{value}</p>
  </div>
</div>
