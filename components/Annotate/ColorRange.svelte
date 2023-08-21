<script lang="ts">
  export let color = 'crimson';
  export let hidden = false;

  const colors = [0xdc143c, 0xffa500, 0xffff00, 0x00ff00, 0x00ffff, 0x4169e1, 0xff00ff, 0xffffff, 0x000000];

  function colorToHEX(color: number): string {
    return (
      '#' +
      Math.max(0, Math.min(Math.round(color), 0xffffff))
        .toString(16)
        .padStart(6, '0')
    );
  }

  function toGradient(colors: number[]): string {
    if (colors.length === 0) return '';
    const colorArray = colors.map(colorToHEX).join(',');
    return (
      `background: ${colorToHEX(colors[0])};` /* For browsers that do not support gradients */ +
      `background: -webkit-linear-gradient(down,${colorArray});` /* For Safari 5.1 to 6.0 */ +
      `background: -o-linear-gradient(down,${colorArray});` /* For Opera 11.1 to 12.0 */ +
      `background: -moz-linear-gradient(down,${colorArray});` /* For Firefox 3.6 to 15 */ +
      `background: linear-gradient(to bottom,${colorArray});` /* Standard syntax (must be last) */
    );
  }

  let colorBar: HTMLElement;
  let colorHandle: HTMLElement;
  let position = 0;

  function blend(a: number, b: number, alpha: number): number {
    return a + alpha * (b - a);
  }

  function gradient(colors: number[], alpha: number): number {
    if (colors.length === 0) return 0;
    if (colors.length === 1) return colors[0];

    const pos = (colors.length - 1) * alpha;
    const i = Math.floor(pos);
    const localAlpha = pos - i;

    if (i === colors.length - 1) return colors[colors.length - 1];

    return (
      (blend(colors[i] & 0xff0000, colors[i + 1] & 0xff0000, localAlpha) & 0xff0000) +
      (blend(colors[i] & 0x00ff00, colors[i + 1] & 0x00ff00, localAlpha) & 0x00ff00) +
      (blend(colors[i] & 0x0000ff, colors[i + 1] & 0x0000ff, localAlpha) & 0x0000ff)
    );
  }

  function handleMouseDown(ev: MouseEvent) {
    if (ev.button === 0) {
      handleColorChange(ev.pageY);
    }
  }

  function handleMouseMove(ev: MouseEvent) {
    if (ev.buttons === 1) {
      handleColorChange(ev.pageY);
    }
  }

  function handleTouchStart(ev: TouchEvent) {
    ev.preventDefault();

    const firstTouch = ev.changedTouches.item(0);

    if (firstTouch) {
      handleColorChange(firstTouch.pageY);
    }
  }

  function handleTouchMove(ev: TouchEvent) {
    const firstTouch = ev.changedTouches.item(0);

    if (firstTouch) {
      handleColorChange(firstTouch.pageY);
    }
  }

  function handleColorChange(pageY: number) {
    const barBoundingBox = colorBar.getBoundingClientRect();
    const handleBoundingBox = colorHandle.getBoundingClientRect();

    const height = barBoundingBox.height - handleBoundingBox.height;
    position = Math.max(0, Math.min(pageY - barBoundingBox.y + 1, height));

    const alpha = position / height;
    color = colorToHEX(gradient(colors, alpha));
  }
</script>

<div
  class="absolute top-16 w-12 h-64"
  {hidden}
  on:mousedown={handleMouseDown}
  on:mousemove={handleMouseMove}
  on:touchstart={handleTouchStart}
  on:touchmove={handleTouchMove}
>
  <div class="absolute top-0 left-5 w-2 h-full rounded-full" style={toGradient(colors)} bind:this={colorBar} />
  <div
    class="absolute box-content left-5 w-2 h-2 rounded-full ring-2 ring-black ring-offset-2 ring-offset-white pointer-events-none"
    style="top: {position}px;"
    bind:this={colorHandle}
  />
</div>
