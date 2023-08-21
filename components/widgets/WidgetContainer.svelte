<script lang="ts">
  // svelte
  import { createEventDispatcher } from 'svelte';

  // lib
  import { userHasRight } from '$baselib/stores';
  import { listToClass } from '$baselib/util';

  // components
  import GridWidget from '$components/GridStack/GridWidget.svelte';
  import RequestCard from '$components/Card/RequestCard.svelte';

  // icons
  import ArrowIcon from '$icons/arrow.svg?component';
  import CloseIcon from '$icons/close.svg?component';
  import SortableIcon from '$icons/sortable.svg?component';

  let class_ = '';
  export { class_ as class };

  export let edit = false;
  export let id = '';
  export let x = 0;
  export let y = 0;
  export let w = 1;
  export let minW = 1;
  export let maxW: number = undefined;
  export let h = 1;
  export let minH = 2;
  export let maxH: number = undefined;
  export let scroll = false;

  export let key: [string, Record<string, any>] = undefined;
  export let raportID = '';
  export let raportBody: Record<string, string> = {};
  export let link: string = undefined;

  const dispatch = createEventDispatcher();
</script>

<GridWidget {id} {x} {y} {w} {minW} {maxW} {h} {minH} {maxH}>
  <a href={!edit ? link : ''} class="block w-full h-full">
    <RequestCard
      class={[scroll ? 'overflow-y-auto h-full' : 'overflow-y-hidden h-full', class_].reduce(listToClass)}
      containerClass="h-full py-5"
      key={key || (raportID && [`raport/getdata/${raportID}`, raportBody])}
      hasRight={$userHasRight('raport', 'getdata')}
      let:loading
      let:data
      on:delete
    >
      <svelte:fragment slot="title">
        {#if edit}
          <SortableIcon class="inline" />
        {/if}
        <slot name="title" />
      </svelte:fragment>
      <svelte:fragment slot="icon">
        {#if edit}
          <button on:click={() => dispatch('delete')} class="w-5 h-5"><CloseIcon class="w-3.5 h-3.5 mx-auto" /></button>
        {:else}
          <slot name="icon">
            <ArrowIcon slot="icon" class="w-5 h-5 rotate-180 text-primary" />
          </slot>
        {/if}
      </svelte:fragment>
      <slot {edit} loading={edit || loading} {data} />
    </RequestCard>
  </a>
</GridWidget>
