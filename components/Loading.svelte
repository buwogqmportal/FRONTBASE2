<script>
  // node modules
  import { ScaleOut } from 'svelte-loading-spinners';
  import { _ } from 'svelte-i18n';

  export let center = true;
  export let value = $_('query.loading');
</script>

<div class="flex flex-col flex-grow justify-center" class:items-center={center}>
  <div class="p-3 text-primary">
    <ScaleOut size="50" />
  </div>
  <div class="pb-3">
    <p>{value}</p>
  </div>
</div>
