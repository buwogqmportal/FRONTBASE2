<script lang="ts">
  import { getProperty, listToClass } from '$baselib/util';

  export let groupClass = '';
  export let contentClass = '';
  export let itemsClass = '';
  export let items: T[];
  export let id: string;
  export let selected: any = undefined;
  export let visibleMobileClass = 'block';
  export let visibleClass = 'lg:block';

  let item: T = undefined;

  type T = $$Generic;

  function select(idVal: any, item_: T) {
    console.log('select');
    selected = idVal;
    item = item_;
  }

  function deselect() {
    selected = undefined;
    item = undefined;
  }
</script>

<div class={[groupClass, visibleClass, selected !== undefined ? 'hidden' : visibleMobileClass].reduce(listToClass)}>
  <slot name="groupBefore" />
  {#if items?.length > 0}
    <div class={itemsClass}>
      <slot name="listBefore" />
      {#each items as item (getProperty(item, id))}
        {@const idVal = getProperty(item, id)}
        <slot name="item" {item} selected={idVal === selected} onSelect={() => select(idVal, item)} />
      {/each}
      <slot name="listAfter" />
    </div>
  {:else}
    <slot name="nodata" />
  {/if}
  <slot name="groupAfter" />
</div>

<div class={[contentClass, visibleClass, selected !== undefined ? visibleMobileClass : 'hidden'].reduce(listToClass)}>
  <slot {item} id={selected} onDeselect={() => deselect()} />
</div>
