<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';
  import { DateTime } from 'luxon';

  // components
  import WidgetCount from './WidgetCount.svelte';

  // icons
  import ToolsIcon from '$icons/tools.svg?component';

  export let edit = false;
  export let title = 'Widget';

  export let id = '';
  export let x = 0;
  export let y = 0;
  export let w = 1;
  export let h = 1;

  const raportID = 'dashboarddefectdeadlinetodaycount';
  const name = 'count_defect_today';
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
  data={{
    timestamp: DateTime.now().startOf('day').toISODate(),
  }}
  color="primary"
  on:delete
>
  <ToolsIcon class="w-6 h-6" slot="icon" />
</WidgetCount>
