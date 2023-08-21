<script lang="ts">
  export let title = '';
  export let hideTooltip = true;
  let isHovered = false;
  let x: number;
  let y: number;
  let width: number;
  let container: HTMLElement;

  function handleEnter(event: MouseEvent | FocusEvent) {
    isHovered = true;
    handleLeave(event);
  }

  function handleLeave(event: MouseEvent | FocusEvent) {
    if (event instanceof MouseEvent) {
      x = event.pageX + 5;
      y = event.pageY + 5;
    } else {
      const box = container.getBoundingClientRect();
      x = box.x + box.width / 2;
      y = box.y + box.height / 2;
    }
    if (x + width > window.innerWidth) {
      x -= width + 5;
    }
  }

  function mouseLeave() {
    isHovered = false;
  }
</script>

<div
  on:mouseover={handleEnter}
  on:focus={handleEnter}
  on:mouseleave={mouseLeave}
  on:blur={mouseLeave}
  on:mousemove={handleLeave}
  bind:this={container}
>
  <slot />
</div>

{#if isHovered && !hideTooltip && title}
  <div
    bind:clientWidth={width}
    style="top: {y}px; left: {x}px;"
    class="border border-secondary-light text-secondary-muted bg-secondary-lighter rounded-lg absolute py-1 px-2 text-xs z-50 whitespace-nowrap"
  >
    {title}
  </div>
{/if}
