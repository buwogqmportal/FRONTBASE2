<script lang="ts" context="module">
  export type SignatureController = {
    save(): string;
    clear(): void;
  };

  export const emptySignatureController: () => SignatureController = () => ({
    save() {
      return '';
    },
    clear() {},
  });
</script>

<script lang="ts">
  // svelte
  import { createEventDispatcher } from 'svelte';

  // node modules
  import SignaturePad from 'signature_pad';
  import { _ } from 'svelte-i18n';

  export let controller: SignatureController = null;
  export let text = '';

  let class_ = '';
  export { class_ as class };

  export let width = 'w-full';
  export let height = ' h-48';

  let canvas: HTMLCanvasElement;
  let signaturePad: SignaturePad;

  const dispatch = createEventDispatcher();

  $: if (controller && typeof controller === 'object') {
    controller.save = function () {
      return signaturePad.toDataURL('images/jpeg');
    };

    controller.clear = function () {
      signaturePad.clear();
    };
  }

  function initSignaturePad() {
    signaturePad = new SignaturePad(canvas, {
      usePointerEvents: false,
      penColor: '#000000',
      dotSize: 0.2,
    });

    signaturePad.addEventListener('beginStroke', () => dispatch('beginStroke'));
    signaturePad.addEventListener('endStroke', () => dispatch('endStroke'));
    signaturePad.addEventListener('beforeUpdateStroke', () => dispatch('beforeUpdateStroke'));
    signaturePad.addEventListener('afterUpdateStroke', () => dispatch('afterUpdateStroke'));
  }

  function resizeCanvas() {
    if (!canvas) return;

    var ratio = Math.max(window.devicePixelRatio || 1, 1);

    canvas.height = 0;

    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;
    canvas.getContext('2d').scale(ratio, ratio);

    signaturePad.clear();
  }

  $: if (canvas) {
    initSignaturePad();
    resizeCanvas();
  }
</script>

<svelte:window on:resize={resizeCanvas} />

<div class="bg-white rounded-lg relative pointer-events-none {height} {width} {class_}">
  <div class="absolute bottom-0 inset-x-16">
    <hr class="border-t-2 border-t-secondary/70 border-dashed" />
    <p class="text-center py-2">
      {text || '\u00A0'}
    </p>
  </div>
  <canvas class="inset-0 w-full h-full pointer-events-auto" bind:this={canvas} />
</div>
