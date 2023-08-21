<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // lib
  import { cardinal } from '$baselib/formater';
  import { topicUnread } from '$baselib/stores';

  // components
  import WidgetContainer from './WidgetContainer.svelte';
  import Badge from '$components/Badge.svelte';

  // icons
  import ArrowIcon from '$icons/arrow.svg?component';

  export let edit = false;

  export let id = '';
  export let x = 0;
  export let y = 0;
  export let w = 1;
  export let h = 1;
</script>

<WidgetContainer scroll {edit} {id} {x} {y} {w} {h} on:delete>
  <svelte:fragment slot="title">
    {$_(`widget.defect_messages.title_${$cardinal.select($topicUnread.count_topicitem)}`, {
      values: {
        value: $topicUnread.count_topicitem,
      },
    })}
  </svelte:fragment>
  <div slot="icon" />

  {#if $topicUnread.count_topicitem > 0}
    <p>{$_('widget.defect_messages.description')}</p>
    <div>
      {#each $topicUnread.items.filter((topic) => topic.topic_type.startsWith('defect')) as row}
        <a href="/defect/details/{row.topic_type_ID}" class="block py-1.5 hover:text-primary">
          {row.topic_title}
          <Badge type="round" class="bg-primary text-white ml-2">{row.unread_topic_items}</Badge>
          <ArrowIcon class="inline-block float-right rotate-180" />
        </a>
      {/each}
    </div>
  {:else}
    <p>{$_('widget.defect_messages.no_data')}</p>
  {/if}
</WidgetContainer>
