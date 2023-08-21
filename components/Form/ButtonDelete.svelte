<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // svelte
  import { createEventDispatcher, getContext } from 'svelte';

  // components
  import Button from './Button.svelte';
  import ModalAlert from '$components/Modal/ModalAlert.svelte';
  import type { ModalContext } from '$components/Modal/ModalProvider.svelte';

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
    | 'ghost' = 'primary';

  export let text = $_('form.button_delete.text');
  export let cancelBtnText = $_('form.button_delete.deny_button');
  export let successBtnText = $_('form.button_delete.accept_button');

  const dispatch = createEventDispatcher();
  const { open, close } = getContext<ModalContext>('simple-modal');

  function accept() {
    open(
      ModalAlert,
      {
        cancelBtnText: cancelBtnText,
        successBtnText: successBtnText,
        text: text,
        onAccept: () => {
          dispatch('accept');
          close();
        },
        onCancel: () => {
          close();
        },
      },
      {},
    );
  }

  let class_ = '';
  export { class_ as class };
</script>

<!-- TODO: add disabled link style -->
<Button
  {type}
  {color}
  class={class_}
  on:click={() => {
    accept();
  }}
>
  <slot />
</Button>
