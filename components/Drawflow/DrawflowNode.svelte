<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';
  import type Drawflow from 'drawflow';

  // svelte
  import { createEventDispatcher, getContext, onMount } from 'svelte';

  // lib
  import type { APIProcessItemConnection } from '$baselib/api/processitem';

  // components
  import DrawflowNodeContent from './DrawflowNodeContent.svelte';
  import ModalAlert from '$components/Modal/ModalAlert.svelte';
  import type { DrawflowContext } from './Drawflow.svelte';
  import type { ModalContext } from '$components/Modal/ModalProvider.svelte';
  import type { APIProcessComponentElement } from '$baselib/api/processcomponent';

  export let id = '';
  export let title = '';
  export let type: string;
  export let typeID: string;
  export let color = '';

  export let numberOfInputs = 1;
  export let availableOutputs: APIProcessComponentElement[] = [
    {
      process_component_element_function: '',
      process_component_element_key: 'output_1',
      process_component_element_title: '',
    },
  ];
  export let outputs: APIProcessItemConnection[] = [];

  export let x = 0;
  export let y = 0;

  export let inspect = false;

  let editor: Drawflow;
  let nodeId: string;

  let comp: DrawflowNodeContent;

  const dispatch = createEventDispatcher();

  let initialized = false;

  const { getEditor } = getContext<DrawflowContext>('drawflow');

  const { open, close } = getContext<ModalContext>('simple-modal');

  function accept() {
    open(
      ModalAlert,
      {
        text: $_('process.details.remove_text'),
        onAccept: () => {
          dispatch('remove');
          close();
        },
        onCancel: () => {
          close();
        },
      },
      {},
    );
  }

  function addOutputColor(output: string, color: string) {
    editor.container.querySelector(`#node-${nodeId} .${output}`)?.classList.add(`color-${color}`);

    editor.container.querySelectorAll(`.node_out_node-${nodeId}.${output}`).forEach((el) => {
      el.classList.add(`color-${color}`);
    });
  }

  function removeOutputColor(output: string) {
    const outputEl = editor.container.querySelector(`#node-${nodeId} .${output}`);

    if (outputEl) {
      outputEl.classList.value = outputEl.classList.value.replaceAll(/ ?color-\w+/g, '');
    }

    editor.container.querySelectorAll(`.node_out_node-${nodeId}.${output}`).forEach((el) => {
      el.classList.value = el.classList.value.replaceAll(/ ?color-\w+/g, '');
    });
  }

  $: if (nodeId && outputs && availableOutputs) {
    for (const out of availableOutputs) {
      if (out.process_component_element_function) {
        addOutputColor(out.process_component_element_key, out.process_component_element_function);
      } else {
        removeOutputColor(out.process_component_element_key);
      }
    }
  }

  onMount(() => {
    editor = getEditor();

    const newId = parseInt(id);

    if (!isNaN(newId)) editor.nodeId = newId;

    nodeId = editor.addNode('', numberOfInputs, availableOutputs.length, x, y, '', {}, '', ({ content, event }) => {
      comp = new DrawflowNodeContent({
        target: content,
        props: { id, title, type, typeID, color, inspect },
      });

      let initial = !id;

      comp.$on('title', (ev) => {
        title = ev.detail;
        if (initial) {
          dispatch('created', title);
        } else {
          dispatch('titleChanged', title);
        }
      });
      comp.$on('cancel', () => {
        dispatch('cancel');
      });
      comp.$on('edit', () => {
        dispatch('edit');
      });
      comp.$on('copy', () => {
        dispatch('copy');
      });
      comp.$on('remove', () => {
        accept();
      });

      event.on('moved', (data: { x: number; y: number }) => {
        x = data.x;
        y = data.y;
        dispatch('moved', data);
      });
      event.on('selected', () => dispatch('selected'));
      event.on('unselected', () => dispatch('unselected'));
      event.on('updated', (data) => dispatch('updated', data));
      event.on('connectionStart', (data: { output_id: string }) => dispatch('connectionStart', data));
      event.on('connectionCreated', (data: { output_id: string; input_id: string }) =>
        dispatch('connectionCreated', data),
      );
      event.on('connectionRemoved', (data: { output_id: string; input_id: string }) =>
        dispatch('connectionRemoved', data),
      );
    });

    initialized = true;

    return () => {
      editor.removeNodeId(`node-${nodeId}`, true);
    };
  });

  $: if (initialized) {
    comp.$set({ id, title, type });
  }

  $: if (initialized) {
    editor.drawflow.drawflow.Home.data[nodeId].pos_x = x;
    editor.drawflow.drawflow.Home.data[nodeId].pos_y = y;

    const elem = editor.container.querySelector(`#node-${nodeId}`) as HTMLElement;
    elem.style.left = x + 'px';
    elem.style.top = y + 'px';
    editor.updateNodeConnections('node-' + id);
  }

  let addingConnections = false;

  $: if (initialized) {
    if (!addingConnections) {
      addingConnections = true;
      (function (editor, outputs) {
        requestAnimationFrame(() => {
          for (const connection of outputs) {
            editor.addConnection(
              connection.process_item_from_ID,
              connection.process_item_to_ID,
              connection.process_item_from_name,
              connection.process_item_to_name,
              true,
            );
          }

          const nodeOutputs = editor.drawflow.drawflow.Home.data[nodeId].outputs;
          for (const output_class in nodeOutputs) {
            if (Object.hasOwnProperty.call(nodeOutputs, output_class)) {
              const output_connections = nodeOutputs[output_class].connections;

              for (const input_item of output_connections) {
                if (
                  !outputs.find(
                    (c) =>
                      c.process_item_from_name === output_class &&
                      c.process_item_to_ID === input_item.node &&
                      c.process_item_to_name === input_item.output,
                  )
                ) {
                  editor.removeConnection(nodeId, input_item.node, output_class, input_item.output, true); //gggggg
                }
              }
            }
          }
        });
      })(editor, outputs);
    }
  }
</script>
