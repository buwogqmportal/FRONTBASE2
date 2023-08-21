<!-- Wohnung/Projekt auswaehlen -->
<script lang="ts">
  // node modules
  import { useQuery } from '@sveltestack/svelte-query';
  import { _ } from 'svelte-i18n';

  // svelte
  import { browser } from '$app/env';

  // lib
  import type { APIProcessItemData, APIProcessActionStep } from '$baselib/api/processaction';
  import type { APIError } from '$baselib/api';
  import type { APISpace } from '$baselib/api/space';
  import { convertTo } from '$baselib/util';
  import { userHasRight } from '$baselib/stores';

  // components
  import type { ProcessNextFunction } from '../Process.svelte';
  import type { APIProject } from '$baselib/api/project';
  import ProcessCardButtonRow from '../ProcessCardButtonRow.svelte';
  import Tiles from '../Tiles.svelte';
  import { BooleanParser, ObjectParser, StringParser } from '$baselib/parse';

  export let finished = false;
  export let data: APIProcessItemData;
  export let step: APIProcessActionStep<{ space_ID: string; project_ID: string }>;
  export let next: ProcessNextFunction;

  const dataParser = new ObjectParser({
    key: new StringParser(),
    textblock: new StringParser(),
    get_project: new BooleanParser(),
    input_required: new BooleanParser(),
    input_show: new BooleanParser(),
    input_select_nodata: new StringParser(),
    button_1_text: new StringParser(),
    button_2_text: new StringParser(),
  });

  let pData = dataParser.toLocal(data);
  $: pData = dataParser.toLocal(data);

  let selected =
    (!pData.get_project && step.process_action_step_data?.space_ID) ||
    (pData.get_project && step.process_action_step_data?.project_ID) ||
    '';

  const spaceResult = useQuery<APISpace[], APIError>(['userspace/getme', { showData: true }], {
    select: convertTo.local.array,
    enabled: browser && $userHasRight('userspace', 'getme') && !pData.get_project && !finished,
  });

  const projectResult = useQuery<APIProject[], APIError>(['projectemployee/getmy', { showData: true }], {
    select: convertTo.local.array,
    enabled: browser && $userHasRight('projectemployee', 'getmy') && pData.get_project && !finished,
  });

  const lastSpaceResult = useQuery<APISpace, APIError>(['space/get', { space_ID: selected }], {
    enabled: browser && $userHasRight('space', 'get') && !pData.get_project && finished,
  });

  const lastProjectResult = useQuery<APIProject, APIError>(['project/getavailable', { project_ID: selected }], {
    enabled: browser && $userHasRight('project', 'getavailable') && pData.get_project && finished,
  });

  $: space = $spaceResult.isSuccess ? $spaceResult.data.find((e) => e.space_ID == selected) : undefined;
  $: project = $projectResult.isSuccess ? $projectResult.data.find((e) => e.project_ID == selected) : undefined;

  $: lastData = $lastProjectResult.isSuccess
    ? {
        title: $lastProjectResult.data.project_data.project_title,
        subtitle: [
          $lastProjectResult.data.project_data.project_location,
          $lastProjectResult.data.project_data.project_street,
        ]
          .filter(Boolean)
          .join(' - '),
      }
    : $lastSpaceResult.isSuccess
    ? {
        title: $lastSpaceResult.data.space_title,
        subtitle: [$lastSpaceResult.data.space_data.space_building, $lastSpaceResult.data.space_data.space_floor]
          .filter(Boolean)
          .join(' - '),
      }
    : undefined;

  $: list =
    pData.get_project && $projectResult.isSuccess
      ? $projectResult.data.map((project) => ({
          id: project.project_ID,
          title: project.project_data.project_title,
          subtitle: [project.project_data.project_location, project.project_data.project_street]
            .filter(Boolean)
            .join(' - '),
        }))
      : !pData.get_project && $spaceResult.isSuccess
      ? $spaceResult.data.map((space) => ({
          id: space.space_ID,
          title: space.space_title,
          subtitle: [space.space_data.space_building, space.space_data.space_floor].filter(Boolean).join(' - '),
        }))
      : undefined;

  $: nextData = project
    ? {
        project_ID: project.project_ID,
      }
    : space
    ? {
        space_ID: space.space_ID,
        project_ID: space.project_ID,
      }
    : undefined;
</script>

<div class="space-y-4 mt-4">
  {#if pData.textblock}
    <div class="whitespace-pre-line">
      {@html pData.textblock}
    </div>
  {/if}

  {#if finished}
    {#if lastData && pData.input_show}
      <Tiles data={[lastData]} selected={() => true} disabled />
    {/if}
  {:else}
    {#if list && pData.input_show}
      <Tiles data={list} selected={(item) => item.id === selected} on:select={(ev) => (selected = ev.detail.id)} />
    {:else if pData.input_show}
      <p>
        {pData.input_select_nodata}
      </p>
    {/if}

    <ProcessCardButtonRow
      {next}
      buttons={[
        { text: pData.button_2_text, output: 'output_2', data: nextData },
        {
          text: pData.button_1_text,
          output: 'output_1',
          data: nextData,
          disabled: pData.input_show && pData.input_required && !selected,
        },
      ]}
    />
  {/if}
</div>
