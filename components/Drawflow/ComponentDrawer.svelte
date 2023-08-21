<script lang="ts">
  import type { APIProcessComponent, APIProcessComponentType } from '$baselib/api/processcomponent';
  import { styleBackgroundColor } from '$baselib/util';
  import { _ } from 'svelte-i18n';

  export let components: APIProcessComponentType[];

  function getHandleDragstart(type: APIProcessComponent) {
    return function (ev: DragEvent) {
      ev.dataTransfer.setData('component', JSON.stringify(type));
    };
  }

  let showComponents = false;
</script>

<div
  class="absolute inset-x-0 bottom-0 shrink-0 {showComponents
    ? 'h-80'
    : 'h-10'} transition-all p-4 overflow-y-auto space-y-4 bg-secondary-lighter"
  on:mouseleave={() => (showComponents = false)}
>
  {#each components as group}
    <h2>{group.process_component_type_title}</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
      {#each group.process_component as comp}
        <div
          class="rounded-lg shadow-lg bg-white text-secondary/70 overflow-hidden m-1 cursor-grab"
          style="flex: 1 1 20rem"
          draggable="true"
          on:dragstart={getHandleDragstart(comp)}
        >
          <h5
            class="bg-secondary-darker text-white p-3 text-sm"
            style={styleBackgroundColor(group.process_component_type_color)}
          >
            {comp.process_component_title}
          </h5>
          <p class="p-3 text-sm">
            {comp.process_component_description}
          </p>
        </div>
      {/each}
    </div>
  {/each}
</div>

<h3
  class="{showComponents ? 'hidden' : 'absolute'} inset-x-0 bottom-0 bg-secondary-lighter text-center leading-10"
  on:mouseenter={() => (showComponents = true)}
>
  {$_('process.details.new_process_step')}
</h3>
