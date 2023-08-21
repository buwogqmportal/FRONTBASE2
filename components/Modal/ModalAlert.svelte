<script>
  import Animation from '$components/Animation.svelte';

  import { _ } from 'svelte-i18n';

  import ModalButtonRow from './ModalButtonRow.svelte';

  export let title = $_('form.button_delete.title');
  export let successBtnText = $_('form.button_delete.accept_button');
  export let cancelBtnText = $_('form.button_delete.deny_button');
  export let text = $_('form.button_delete.text');
  export let cancelBtn = true;

  export let onAccept = () => {};
  export let onCancel = () => {};
</script>

<Animation name="alert" class="h-24 mt-6 mb-4" loop={false} speed={0.5} />

<div class="flex flex-col justify-center items-center">
  <div class="">
    <h4 class="font-black text-xl mb-2.5">{title}</h4>
  </div>
  {text}
</div>

<ModalButtonRow class="mt-6" {cancelBtn} {successBtnText} {cancelBtnText} on:success={onAccept} on:cancel={onCancel} />
