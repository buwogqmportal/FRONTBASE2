<script lang="ts">
  // lib
  import { FileRequest } from '$baselib/api/file';

  // icons
  import UserIcon from '$icons/user.svg?component';
  import Tooltip from './Tooltip.svelte';

  export let id = '';
  export let loading = false;
  export let theme: 'light' | 'dark' | 'default' = 'default';
  export let owner_name = '';
  export let size: 'normal' | 'small' = 'normal';
  export let tooltip = false;

  let error = false;

  $: getInitialLetters = owner_name
    .split(' ')
    .filter((str) => str)
    .map((str) => str[0])
    .slice(0, 2)
    .join('');
</script>

{#if loading}
  <div
    class={['rounded-full bg-secondary-light animate-pulse', { normal: 'w-12 h-12', small: 'w-8 h-8' }[size]].join(' ')}
  />
{:else if id && id !== 'placeholder' && id !== 'user_placeholder' && !error}
  <Tooltip title={tooltip ? owner_name : ''}>
    <img
      class={['rounded-full object-cover', { normal: 'w-12 h-12', small: 'w-8 h-8' }[size]].join(' ')}
      src={FileRequest.getURL(id)}
      alt="profil"
      on:error={() => (error = true)}
    />
  </Tooltip>
{:else}
  <Tooltip title={tooltip ? owner_name : ''}>
    <div
      class={[
        'rounded-full',
        {
          light: 'bg-white text-secondary-muted',
          dark: 'bg-secondary-muted text-secondary-lighter',
          default: 'bg-secondary-lighter text-secondary',
        }[theme],
        { normal: 'w-12 h-12', small: 'w-8 h-8' }[size],
      ].join(' ')}
    >
      <div class={['flex items-center justify-center', { normal: 'w-12 h-12', small: 'w-8 h-8' }[size]].join(' ')}>
        {#if owner_name !== ''}
          <span class={['select-none', { normal: '', small: 'text-xs' }[size]].join(' ')}>{getInitialLetters}</span>
        {:else}
          <UserIcon />
        {/if}
      </div>
    </div>
  </Tooltip>
{/if}
