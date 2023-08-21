<script lang="ts">
  export let type: 'primary' | 'secondary' | 'gray' | 'white' = 'secondary';
  export let submit = false;
  export let disabled = false;

  let class_ = '';
  export { class_ as class };
</script>

<button
  type={submit ? 'submit' : 'button'}
  {disabled}
  class={[
    'h-12 w-12 shrink-0 flex items-center justify-center rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
    {
      primary: 'bg-primary text-white',
      secondary: 'bg-white text-secondary',
      gray: 'bg-secondary-muted text-white',
      white: 'bg-white text-primary',
      disabled: 'bg-secondary-light text-secondary cursor-default',
    }[disabled ? 'disabled' : type],
    class_,
  ].join(' ')}
  on:click
>
  <slot />
</button>
