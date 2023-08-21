<script lang="ts">
  import { userHasRight } from '$baselib/stores';
  import Button from '$components/Form/Button.svelte';
  import Link from '$components/Link.svelte';
  import { Circle } from 'svelte-loading-spinners';
  import type { ProcessNextFunction } from './Process.svelte';

  export let next: ProcessNextFunction = undefined;
  export let buttons: {
    text: string;
    output?: string;
    callback?: () => void;
    href?: string;
    data?: any;
    color?:
      | 'blank'
      | 'primary'
      | 'secondary'
      | 'alert'
      | 'gray'
      | 'white'
      | 'whiteSecondary'
      | 'success'
      | 'ghost'
      | 'ghostDark';
    disabled?: boolean;
  }[];

  $: effectiveButtons = buttons.filter(({ text }) => text);

  let clickedButton = 0;
</script>

{#if $userHasRight('processaction', 'next') && effectiveButtons.length > 0}
  <div class="grid gap-4 grid-cols-1 md:grid-cols-2">
    {#each effectiveButtons as { text, callback, href, output, data, color, disabled }, i}
      {#if typeof href === 'string'}
        <Link
          class="md:last:odd:col-start-2 flex items-center justify-center space-x-2"
          href={href.replace(/&amp;/g, '&')}
          newTab
          type="button"
          color={color ?? (output === 'output_1' ? 'primary' : 'secondary')}
          on:click={callback}
        >
          {#if !next && clickedButton === i}
            <Circle size="1.25" unit="rem" color="white" />
          {/if}
          <span>
            {text}
          </span>
        </Link>
      {:else}
        <Button
          disabled={disabled || !next}
          class="md:last:odd:col-start-2 flex items-center justify-center space-x-2"
          color={color ?? (output === 'output_1' ? 'primary' : 'secondary')}
          on:click={() => {
            (callback ?? (() => next(output, data)))();
            clickedButton = i;
          }}
        >
          {#if !next && clickedButton === i}
            <Circle size="1.25" unit="rem" color="white" />
          {/if}
          <span>
            {text}
          </span>
        </Button>
      {/if}
    {/each}
  </div>
{/if}
