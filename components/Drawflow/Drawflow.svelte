<script lang="ts" context="module">
  export type SizedDrawflowNode = DrawflowNode & { width: number; height: number };

  export type DrawflowContext = {
    getEditor: () => Drawflow;
  };
</script>

<script lang="ts">
  // style

  // node modules
  import Drawflow, {
    type DrawflowConnection,
    type DrawflowConnectionOut,
    type DrawflowData,
    type DrawflowNode,
    type DrawflowPoint,
  } from 'drawflow';

  // svelte
  import { createEventDispatcher, onMount, setContext } from 'svelte';

  // lib
  import type { APIProcessComponent } from '$baselib/api/processcomponent';

  // components
  import { showNodes } from './layout';

  const dispatch = createEventDispatcher();

  export let canvasSize: DOMRect = null;
  export let safeArea: { top?: number; left?: number; right?: number; bottom?: number } = {};
  export let focusNode: string = null;
  export let view: DOMRect = null;

  export function moveView(x: number, y: number) {
    editor.canvas_x = x;
    editor.canvas_y = y;
    editor.refreshZoom();
  }

  let container: HTMLDivElement = null;

  let editor: Drawflow = null;

  function handleDragover(ev: DragEvent) {
    ev.preventDefault();
  }

  function handleDrop(ev: DragEvent) {
    const comp: APIProcessComponent = JSON.parse(ev.dataTransfer.getData('component'));

    const canvasRect = editor.precanvas.getBoundingClientRect();

    const x = (ev.clientX - canvasRect.x) / editor.zoom;
    const y = (ev.clientY - canvasRect.y) / editor.zoom;

    dispatch('nodeCreated', {
      comp,
      x,
      y,
    });
  }

  setContext('drawflow', {
    getEditor: () => editor,
  });

  onMount(() => {
    editor = new Drawflow(container);
    editor.force_first_input = true;
    editor.start();

    let selected: string;

    editor.on('nodeSelected', (id: string) => {
      selected = `node-${id}`;
      requestAnimationFrame(() => editor.updateNodeConnections(selected));
    });

    editor.on('nodeDeselected', () => {
      editor.updateNodeConnections(selected);
      selected = undefined;
    });

    const transform = showNodes(editor.container.getBoundingClientRect(), canvasSize, safeArea);

    editor.canvas_x = transform.pan_x;
    editor.canvas_y = transform.pan_y;
    editor.zoom_min = Math.min(1 / 10, transform.zoom);
    editor.zoom = transform.zoom;
    editor.refreshZoom();

    function getView() {
      const pc = editor.precanvas.getBoundingClientRect();
      const viewport = editor.container.getBoundingClientRect();
      return new DOMRect(
        (viewport.x - pc.x) / editor.zoom,
        (viewport.y - pc.y) / editor.zoom,
        viewport.width / editor.zoom,
        viewport.height / editor.zoom,
      );
    }

    requestAnimationFrame(() => {
      editor.refreshZoom();
      view = getView();
    });

    editor.on('translate', () => {
      view = getView();
    });

    editor.on('zoom', () => {
      view = getView();
    });

    editor.on('nodeSelected', (id) => {
      for (const el of container.querySelectorAll(
        `.node_in_node-${id}, .node_out_node-${id}`,
      ) as unknown as HTMLElement[]) {
        el.classList.add('active');
      }
    });

    editor.on('nodeDeselected', () => {
      for (const el of container.querySelectorAll('.connection.active') as unknown as HTMLElement[]) {
        el.classList.remove('active');
      }
    });

    editor.on('click', (data: MouseEvent | TouchEvent) => dispatch('click', data));
    editor.on('clickEnd', (data: MouseEvent | TouchEvent) => dispatch('clickEnd', data));
    editor.on('connectionCancel', (data: true) => dispatch('connectionCancel', data));
    editor.on('connectionCreated', (data: DrawflowConnection) => dispatch('connectionCreated', data));
    editor.on('connectionDeselected', (data: true) => dispatch('connectionDeselected', data));
    editor.on('connectionRemoved', (data: DrawflowConnection) => dispatch('connectionRemoved', data));
    editor.on('connectionSelected', (data: DrawflowConnection) => dispatch('connectionSelected', data));
    editor.on('connectionStart', (data: DrawflowConnectionOut) => dispatch('connectionStart', data));
    editor.on('contextmenu', (data: MouseEvent) => dispatch('contextmenu', data));
    editor.on('export', (data: DrawflowData) => dispatch('export', data));
    editor.on('import', (data: 'import') => dispatch('import', data));
    editor.on('keydown', (data: KeyboardEvent) => dispatch('keydown', data));
    editor.on('moduleChanged', (data: string) => dispatch('moduleChanged', data));
    editor.on('moduleCreated', (data: string) => dispatch('moduleCreated', data));
    editor.on('moduleRemoved', (data: string) => dispatch('moduleRemoved', data));
    editor.on('mouseMove', (data: DrawflowPoint) => dispatch('mouseMove', data));
    editor.on('mouseUp', (data: MouseEvent | TouchEvent) => dispatch('mouseUp', data));
    // editor.on('nodeCreated', (data: string) => dispatch('nodeCreated', data));
    editor.on('nodeDataChanged', (data: string) => dispatch('nodeDataChanged', data));
    editor.on('nodeDeselected', (data: true) => dispatch('nodeDeselected', data));
    editor.on('nodeMoved', (data: { id: string } & DrawflowPoint) => dispatch('nodeMoved', data));
    editor.on('nodeRemoved', (data: string) => dispatch('nodeRemoved', data));
    editor.on('nodeSelected', (data: string) => dispatch('nodeSelected', data));
    editor.on('rerouteCreated', (data: string) => dispatch('rerouteCreated', data));
    editor.on('rerouteMoved', (data: string) => dispatch('rerouteMoved', data));
    editor.on('rerouteRemoved', (data: string) => dispatch('rerouteRemoved', data));
    editor.on('translate', (data: DrawflowPoint) => dispatch('translate', data));
    editor.on('updateNodeId', (data: { oldId: string; newId: string }) => dispatch('updateNodeId', data));
    editor.on('updateNodes', (data: { id: string; data: unknown }) => dispatch('updateNodes', data));
    editor.on('zoom', (data: number) => dispatch('zoom', data));
  });

  $: if (editor && focusNode) {
    const el = editor.container.querySelector(`#node-${focusNode}`);
    const node = editor.getNodeFromId(focusNode);

    if (el) {
      const box = new DOMRect(node.pos_x, node.pos_y, el.clientWidth, el.clientHeight);

      editor.zoom = 1;
      editor.refreshZoom();
      editor.canvas_x = -(box.x + box.width / 2 - editor.container.clientWidth / 2);
      editor.canvas_y = -(box.y + box.height / 2 - editor.container.clientHeight / 2);
      editor.refreshZoom();
    }

    focusNode = null;
  }
</script>

<div class="relative w-full h-full overflow-hidden">
  <div bind:this={container} class="w-full h-full" on:dragover={handleDragover} on:drop={handleDrop} />

  {#if editor}
    <slot />
  {/if}
</div>
