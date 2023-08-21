<script lang="ts">
  import type { APIDefect } from '$baselib/api/defect';
  import ApiSelect from '$components/Form/APISelect.svelte';
  import { userHasRight } from '$baselib/stores';

  // node modules
  import { _ } from 'svelte-i18n';
  import LocalSelect from '$components/Form/LocalSelect.svelte';
  import Input from '$components/Form/Input.svelte';
  import Textarea from '$components/Form/Textarea.svelte';
  import DatePicker from '$components/Form/DatePicker.svelte';
  import Badge from '$components/Badge.svelte';

  // components

  export let project = '';

  export let trade = '';
  export let show_trade = true;

  export let firm = '';
  export let show_firm = true;

  export let description_ID = '';
  export let show_description_ID = true;

  export let category = '';
  export let show_category = true;

  export let title = '';
  export let show_title = true;

  export let description = '';
  export let show_description = true;

  export let client_status = '';
  export let show_client_status = true;

  export let deadline = '';
  export let show_deadline = true;

  export let priority = '';
  export let show_priority = true;
</script>

{#if show_trade}
  <ApiSelect
    name="trade_ID"
    label={$_('defect.form.trade')}
    disabled={!project}
    right={$userHasRight('trades', 'getbyproject') && Boolean(project)}
    query="trades/getbyproject/{project}"
    valueKey="trades_ID"
    labelKey="trades_title"
    bind:value={trade}
  />
{/if}

{#if show_firm}
  <ApiSelect
    name="firm_ID"
    label={$_('defect.form.supplier')}
    disabled={!project || !trade}
    right={$userHasRight('firm', 'getbytradesproject') && Boolean(project && trade)}
    query={[
      'firm/getbytradesproject',
      {
        project_ID: project,
        trades_ID: trade,
      },
    ]}
    valueKey="firm_ID"
    labelKey="firm_title"
    bind:value={firm}
  />
{/if}

{#if show_description_ID}
  <ApiSelect
    name="defect_description_ID"
    label={$_('defect.form.type')}
    right={$userHasRight('defectdescription', 'getall')}
    query="defectdescription/getall"
    valueKey="defect_description_ID"
    labelKey="defect_description_title"
    bind:value={description_ID}
  />
{/if}

{#if show_category}
  <LocalSelect name="defect_category" label={$_('defect.form.category')} bind:value={category} />
{/if}

{#if show_title}
  <Input
    name="defect_title"
    label={$_('defect.form.title')}
    placeholder={$_('defect.form.title_description')}
    bind:value={title}
  />
{/if}
{#if show_description}
  <Textarea
    name="defect_description"
    label={$_('defect.form.description')}
    placeholder={$_('defect.form.description_placeholder')}
    bind:value={description}
  />
{/if}

{#if show_client_status}
  <LocalSelect name="defect_client_status" label={$_('defect.form.client_status')} bind:value={client_status} />
{/if}
{#if show_deadline}
  <DatePicker
    name="defect_deadline"
    type="date"
    label={$_('defect.form.deadline')}
    bind:value={deadline}
    disable_past
  />
{/if}
{#if show_priority}
  <LocalSelect name="defect_priority" label={$_('defect.form.priority')} bind:value={priority} />
{/if}
