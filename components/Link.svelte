<script lang="ts">
  export let type: 'link' | 'button' = 'link';
  export let color:
    | 'blank'
    | 'primary'
    | 'secondary'
    | 'alert'
    | 'gray'
    | 'white'
    | 'whiteSecondary'
    | 'success'
    | 'ghost'
    | 'ghostDark' = 'primary';

  export let href: string = '';
  export let newTab = false;

  let class_ = '';
  export { class_ as class };

  // note: tailwind won't include classes if the classname is not complete
  $: typeClass = {
    button: 'c-button',
    link: 'c-link',
  }[`${type}`];
</script>

<!-- TODO: add disabled link style -->
<a
  class={[
    typeClass,
    {
      button_blank: '',
      button_primary: 'bg-primary text-white',
      button_secondary: 'bg-secondary text-white',
      button_alert: 'bg-alert text-white',
      button_gray: 'bg-secondary-muted text-white',
      button_white: 'bg-white text-primary',
      button_whiteSecondary: 'bg-white text-secondary-darker',
      button_success: 'bg-success text-white',
      button_ghost: 'bg-white text-secondary border border-secondary',
      button_ghostDark: 'text-white border border-white',
      link_blank: '',
      link_primary: 'text-primary',
      link_secondary: 'text-secondary',
      link_alert: 'text-alert',
      link_gray: 'text-secondary-muted',
      link_white: 'text-white',
      link_whiteSecondary: 'text-white',
      link_success: 'text-success',
      link_ghost: 'text-secondary border p-2 border-secondary',
      link_ghostDark: 'text-white border p-2 border-white',
      disabled: 's-disabled',
    }[!href ? 'disabled' : `${type}_${color}`],
    class_,
  ].join(' ')}
  disabled={!href}
  target={newTab && href ? '_blank' : ''}
  {href}
  on:click
>
  <slot />
</a>
