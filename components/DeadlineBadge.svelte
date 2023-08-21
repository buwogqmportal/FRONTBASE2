<script lang="ts">
  import { relativeDateFormat } from '$baselib/formater';

  import { _ } from 'svelte-i18n';
  import Badge from './Badge.svelte';

  let class_ = '';
  export { class_ as class };
  export let date = new Date();
  export let loading = false;

  function getDeadlineLabel(date: Date) {
    const nowWTime = new Date();
    const now = new Date(nowWTime.getFullYear(), nowWTime.getMonth(), nowWTime.getDate());

    if (date.getTime() < now.getTime()) {
      return $_('defect.deadline_overdue');
    }

    const time = $relativeDateFormat.format(date);

    if (time === 'date') {
      return $_('defect.deadline_later');
    } else if (time === 'week') {
      return $_('defect.deadline_week');
    } else {
      return $_(`relativeDate.${time}`);
    }
  }

  function getDeadlineClass(date: Date) {
    const nowWTime = new Date();
    const now = new Date(nowWTime.getFullYear(), nowWTime.getMonth(), nowWTime.getDate());

    if (date.getTime() < now.getTime()) {
      return 'bg-alert text-white';
    }

    const time = $relativeDateFormat.format(date);

    if (time === 'date') {
      return 'bg-secondary text-white';
    } else if (time === 'week') {
      return 'bg-warning text-white';
    } else if (time === 'today') {
      return 'bg-primary text-white';
    } else {
      return 'bg-alert text-white';
    }
  }
</script>

{#if loading}
  <Badge class="bg-secondary-light animate-pulse h-7" />
{:else}
  <Badge class={[class_, getDeadlineClass(date)].join(' ')}>
    {getDeadlineLabel(date)}
  </Badge>
{/if}
