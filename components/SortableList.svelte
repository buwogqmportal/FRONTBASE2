<script lang="ts">
  import { quintOut } from 'svelte/easing';
  import { crossfade } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  // FLIP ANIMATION
  const [send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * 200),

    fallback(node) {
      const style = getComputedStyle(node);
      const transform = style.transform === 'none' ? '' : style.transform;

      return {
        duration: 10,
        easing: quintOut,
        css: (t) => `
                      transform: ${transform} scale(${t});
                      opacity: ${t}
                  `,
      };
    },
  });

  // DRAG AND DROP
  let isOver = false;
  const getDraggedParent = (node: { dataset: { index: any }; parentNode: any }) =>
    (node.dataset.index && node.dataset) || getDraggedParent(node.parentNode);
  const start = (ev: DragEvent) => {
    ev.dataTransfer.setData('source', (<HTMLElement>ev.target).dataset.index);
    ev.dataTransfer.dropEffect = 'move';
  };
  const over = (ev: any) => {
    ev.preventDefault();
    let dragged = getDraggedParent(ev.target);
    if (isOver !== dragged.id) isOver = JSON.parse(dragged.id);
  };
  const leave = (ev: any) => {
    let dragged = getDraggedParent(ev.target);
    if (isOver === dragged.id) isOver = false;
  };
  const drop = (ev: any) => {
    isOver = false;
    ev.preventDefault();
    let dragged = getDraggedParent(ev.target);
    let from: number = ev.dataTransfer.getData('source');
    let to: number = dragged.index;
    reorder({ from, to });
  };

  // DISPATCH REORDER
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  const reorder = ({ from, to }) => {
    let newList = [...list];

    newList = move(newList, from, to);

    //line to just swap elements no insert them between
    //newList[from] = [newList[to], (newList[to] = newList[from])][0];

    dispatch('sort', newList);
  };

  const move = (arr: any[], from: number, to: number) => {
    arr.splice(to, 0, arr.splice(from, 1)[0]);
    return arr;
  };

  // UTILS
  const getKey = (item: any) => (key ? item[key] : item);

  // PROPS
  type T = $$Generic;
  export let list: T[];
  export let key: string;
  export let dragEnabler: (e: T, i: number) => boolean = () => true;
</script>

{#if list && list.length}
  <ul>
    {#each list as item, index (getKey(item))}
      <li
        data-index={index}
        data-id={JSON.stringify(getKey(item))}
        draggable={dragEnabler(item, index)}
        on:dragstart={start}
        on:dragover={over}
        on:dragleave={leave}
        on:drop={drop}
        in:receive={{ key: getKey(item) }}
        out:send={{ key: getKey(item) }}
        animate:flip={{ duration: 300 }}
        class:over={getKey(item) === isOver}
        class="mx-1"
      >
        <slot {item} {index}>
          <p>{getKey(item)}</p>
        </slot>
      </li>
    {/each}
  </ul>
{/if}

<style>
  ul {
    list-style: none;
    padding: 0;
  }
  li {
    border-top: 2px dotted transparent;
    transition: border 0.1s linear;
  }
  .over {
    border-color: rgba(48, 12, 200, 0.2);
  }
</style>
