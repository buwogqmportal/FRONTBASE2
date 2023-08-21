<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // lib
  import { cardinal } from '$baselib/formater';
  import { topicUnread } from '$baselib/stores';

  // components
  import WidgetContainer from './WidgetContainer.svelte';

  // icons
  import ArrowIcon from '$icons/arrow.svg?component';
  import MessageIcon from '$icons/message.svg?component';

  export let edit = false;
  export let title = 'Widget';

  export let id = '';
  export let x = 0;
  export let y = 0;
  export let w = 1;
  export let h = 1;
</script>

<WidgetContainer link="/topic" class={'bg-primary text-white border-0'} {edit} {id} {x} {y} {w} {h} on:delete>
  <svelte:fragment slot="title">
    {#if !edit}
      <MessageIcon class="w-6 h-6 text-white" />
    {/if}
  </svelte:fragment>
  <ArrowIcon slot="icon" class="w-5 h-5 rotate-180 text-white" />

  {#if edit}
    <div>{title}</div>
  {:else}
    <p class="whitespace-nowrap truncate">
      {$_(`widget.count_topic.${$cardinal.select($topicUnread.count_topicitem)}`, {
        values: {
          value: $topicUnread.count_topicitem ?? 0,
        },
      })}
    </p>
  {/if}
</WidgetContainer>
