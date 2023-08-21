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

  const raportID = 'dashboarddefectdeadlinethismonthcount';
  const name = 'count_defect_month';
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
    start_timestamp: DateTime.now().toUTC().startOf('month').toSeconds().toString(),
    end_timestamp: DateTime.now().toUTC().startOf('month').plus({ month: 1 }).toSeconds().toString(),
  }}
  color="secondary"
  on:delete
>
  <ToolsIcon class="w-6 h-6" slot="icon" />
</WidgetCount>
