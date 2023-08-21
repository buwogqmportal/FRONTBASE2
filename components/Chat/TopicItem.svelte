<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // svelte
  import { createEventDispatcher } from 'svelte';

  // lib
  import type { APISearchResultHit } from '$baselib/api/search';
  import { dateFormat, dateFromAPIDate, relativeDateFormat, timeFormat } from '$baselib/formater';

  //components
  import GroupViewTile from '$components/GroupViewTile.svelte';

  // icons
  import ContactIcon from '$icons/chat_contact.svg?component';
  import ClientContactIcon from '$icons/chat_contact_client.svg?component';
  import FirmContactIcon from '$icons/chat_contact_firm.svg?component';

  const dispatch = createEventDispatcher();

  export let data: Partial<{
    topic_ID: string;
    topic_title: string;
    topic_type: string;
    topic_item_created?: string;
    firm_title?: string;
    project_title?: string;
  }>;
  export let active = false;
  export let unread = false;

  function formatRealativeDate(date: string): string {
    const dateParsed = dateFromAPIDate(date);

    if (!dateParsed) return '';

    const formatter = $relativeDateFormat.format(dateParsed);

    if (formatter === 'today') {
      return $timeFormat.format(dateFromAPIDate(date));
    } else if (formatter === 'date' || formatter === 'week') {
      return $dateFormat.format(dateFromAPIDate(date));
    } else {
      return $_(`relativeDate.${formatter}`);
    }
  }
</script>

<GroupViewTile
  title={data.topic_title}
  subtitle={data.topic_type.startsWith('defect')
    ? data.firm_title || data.project_title
    : data.topic_type === 'firm'
    ? data.project_title
    : `ID: ${data.topic_ID}`}
  extra={formatRealativeDate(data.topic_item_created)}
  {active}
  on:click={() => dispatch('select')}
>
  <div slot="image" class:text-primary={unread}>
    {#if data.topic_type.startsWith('defect')}
      <ClientContactIcon />
    {:else if data.topic_type === 'firm'}
      <FirmContactIcon />
    {:else}
      <ContactIcon />
    {/if}
  </div>
</GroupViewTile>
