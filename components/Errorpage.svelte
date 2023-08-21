<script lang="ts">
  // node modules
  import { state } from '$baselib/stores';
  import { _ } from 'svelte-i18n';

  // components
  import Link from './Link.svelte';
  import Meta from './Meta.svelte';
</script>

<Meta showHeader={false} />
<div class="h-full flex flex-col flex-grow justify-center items-center space-y-4">
  <h1 class="mb-6 text-6xl font-black text-secondary text-opacity-40">
    <slot name="title">
      {$_('error.default.title')}
    </slot>
  </h1>
  <p class="text-secondary text-opacity-70 font-bold">
    <slot name="subtitle">{$_('error.head')}</slot>
  </p>
  <p class="text-secondary text-opacity-70 text-center">
    <slot name="text">
      {$_('error.default.text')}
    </slot>
  </p>
  <Link type="button" color="primary" href="/">
    {#if $state.isSignedIn}
      {$_('error.todashboard')}
    {:else}
      {$_('error.tologin')}
    {/if}
  </Link>
</div>
