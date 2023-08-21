<script lang="ts">
  export let type: 'link' | 'button' = 'button';
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

  export let disabled = false;
  export let submit = false;
  export let id = '';

  let class_ = '';
  export { class_ as class };
</script>

<button
  type={submit ? 'submit' : 'button'}
  class={[
    {
      button: 'c-button',
      link: 'c-link',
    }[type],
    {
      button_blank: '',
      button_primary: 'bg-primary text-white',
      button_secondary: 'bg-secondary text-white',
      button_alert: 'bg-alert text-white',
      button_gray: 'bg-secondary-muted text-white',
      button_white: 'bg-white text-primary',
      button_whiteSecondary: 'bg-white text-secondary-darker',
      button_success: 'bg-success text-white',
      button_ghost: 'text-secondary ring-1 ring-secondary',
      button_ghostDark: 'text-secondary ring-1 ring-secondary',
      link_blank: '',
      link_primary: 'text-primary',
      link_secondary: 'text-secondary',
      link_alert: 'text-alert',
      link_gray: 'text-secondary-muted',
      link_white: 'text-white',
      link_whiteSecondary: 'text-white',
      link_success: 'text-success',
      link_ghost: 'text-secondary ring-1 ring-secondary',
      link_ghostDark: 'text-secondary-lighter ring-1 ring-white',
      disabled: 's-disabled',
    }[disabled ? 'disabled' : `${type}_${color}`],
    class_,
  ].join(' ')}
  {id}
  {disabled}
  on:click
>
  <slot />
</button>
