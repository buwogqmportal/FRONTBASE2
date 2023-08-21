<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // components
  import SettingsIcon from '$icons/settings.svg?component';

  export let disabled = false;
  export let active = false;
  export let activeMobile: boolean = undefined;

  let class_ = '';
  export { class_ as class };
</script>

<button
  class={[
    'h-12 w-12 shrink-0 flex items-center justify-center c-input bg-white',
    active ? 'md:text-primary' : 'md:text-secondary/70',
    activeMobile ?? active ? 'text-primary' : 'text-secondary/70',
    class_,
  ].join(' ')}
  {disabled}
  on:click
>
  <slot>
    <SettingsIcon />
  </slot>
</button>
