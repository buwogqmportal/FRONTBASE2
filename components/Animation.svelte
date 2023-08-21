<script lang="ts">
  import type { AnimationItem } from 'lottie-web';
  import bodymovin from 'lottie-web';
  import { createEventDispatcher, onMount } from 'svelte';

  export let name = '';
  export let playback: 'play' | 'pause' | 'stop' = 'play';
  export let speed = 0.6;
  export let loop = true;
  export let direction: 1 | -1 = 1;
  let class_ = '';
  export { class_ as class };

  let container: HTMLElement;
  let animation: AnimationItem;
  $: animation?.setSpeed(speed);
  $: animation?.setDirection(direction);

  const dispatch = createEventDispatcher();

  onMount(() => {
    animation = bodymovin.loadAnimation({
      container: container,
      renderer: 'svg',
      loop: loop,
      autoplay: playback === 'play',
      path: `/animations/${name}.json`,
    });

    animation.addEventListener('complete', () => {
      dispatch('complete');
    });
    animation.addEventListener('loopComplete', () => {
      dispatch('loopComplete');
    });

    animation.setSpeed(speed);
    animation.setDirection(direction);
    return () => {
      animation.destroy();
    };
  });
</script>

<div bind:this={container} class={class_} />
