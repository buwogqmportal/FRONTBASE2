<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // components
  import WidgetCount from './WidgetCount.svelte';

  // icons
  import ToolsIcon from '$icons/tools.svg?component';
  import { state } from '$baselib/stores';
  import { DateTime } from 'luxon';

  export let edit = false;
  export let title = 'Widget';

  export let id = '';
  export let x = 0;
  export let y = 0;
  export let w = 1;
  export let h = 1;

  $: user_ID = $state.user?.user_ID;
  $: raportID = user_ID ? 'dashboarddefectacquirerdeadlinepastcount' : '';
  const name = 'count_defect_acquirer_overdue';
</script>

<WidgetCount
  {title}
  {edit}
  {id}
  {x}
  {y}
  {w}
  {h}
  {raportID}
  {name}
  data={{ user_ID, timestamp: DateTime.now().startOf('day').toSeconds().toString() }}
  color="alert"
  on:delete
>
  <ToolsIcon class="w-6 h-6" slot="icon" />
</WidgetCount>
