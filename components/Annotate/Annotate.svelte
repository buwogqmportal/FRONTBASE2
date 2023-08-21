<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // svelte
  import { getContext } from 'svelte';

  // components
  import Button from '$components/Form/Button.svelte';
  import Canvas from './Canvas.svelte';
  import ColorRange from './ColorRange.svelte';
  import IconButton from '$components/Form/IconButton.svelte';
  import type { ModalContext } from '$components/Modal/ModalProvider.svelte';

  // icons
  import DrawIcon from '$icons/edit.svg?component';
  import UndoIcon from '$icons/undo.svg?component';
  import CloseIcon from '$icons/close.svg?component';
  import CheckIcon from '$icons/checkmark.svg?component';

  const { close } = getContext<ModalContext>('simple-modal');

  let color: string;

  let canvas: Canvas;

  export let imageID: string;
  export let onCancel = () => {};
  export let onSave: (dataURI: String) => void = () => {};

  function handleCancel() {
    onCancel();

    close();
  }

  function handleSave() {
    onSave(canvas.exportDataURI());

    close();
  }

  let isDrawing = false;
  let showColor = true;
</script>

<Canvas
  bind:this={canvas}
  {imageID}
  {color}
  on:beginStroke={() => (isDrawing = true)}
  on:endStroke={() => (isDrawing = false)}
/>

<div class="absolute top-6 inset-x-6 flex flex-row space-x-4">
  <div>
    <IconButton class="shadow-md" type="primary" on:click={() => (showColor = !showColor)}>
      <DrawIcon />
    </IconButton>
    <ColorRange hidden={isDrawing || !showColor} bind:color />
  </div>
  <IconButton class="shadow-md" on:click={() => canvas.undo()}>
    <UndoIcon />
  </IconButton>
  <div class="grow" />
  <IconButton class="shadow-md menu:hidden" on:click={handleCancel}><CloseIcon /></IconButton>
  <IconButton class="shadow-md menu:hidden" type="primary" on:click={handleSave}
    ><CheckIcon width="18" height="18" /></IconButton
  >
</div>

<div class="absolute bottom-6 right-6 flex flex-row space-x-4">
  <Button class="shadow-md hidden menu:block" color="white" on:click={handleCancel}>{$_('annotate.cancel')}</Button>
  <Button class="shadow-md hidden menu:block" color="primary" on:click={handleSave}>{$_('annotate.save')}</Button>
</div>
