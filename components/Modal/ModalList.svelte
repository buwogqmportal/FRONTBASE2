<script lang="ts">
  //svelte
  import type { APIColuser } from '$baselib/api/coluser';

  // components
  import SortableList from '$components/SortableList.svelte';
  import ModalButtonRow from './ModalButtonRow.svelte';
  import SortableListItem from '$components/SortableListItem.svelte';
  import { collator } from '$baselib/formater';

  //input data
  export let data: APIColuser[] = [];
  export let dataMobile: APIColuser[] = null;
  export let onSuccess: (newCols: APIColuser[], newColsMobile?: APIColuser[]) => void;

  //called when submit button is pressed
  const handleDataOnSuccess = () => {
    onSuccess(data, dataMobile);
  };

  /*-----------------------------------------*/

  export let successBtnText = 'Übernehmen';
  //given function closes the modal after handle the data

  $: data = sortItems(data);
  $: if (dataMobile) {
    dataMobile = sortItems(dataMobile);
  }

  function sortItems(data: APIColuser[]) {
    const enabledElements = data.filter((elem) => elem.col_user_enabled);
    const disabledElements = data
      .filter((elem) => !elem.col_user_enabled)
      .sort((a, b) => $collator.compare(a.col_title, b.col_title));
    return enabledElements.concat(disabledElements);
  }

  const onChange = (ev: CustomEvent) => {
    const element = data[ev.detail.index];
    element.col_user_enabled = ev.detail.enabled;
    data = data;
  };

  const onChangeMobile = (ev: CustomEvent) => {
    const element = dataMobile[ev.detail.index];
    element.col_user_enabled = ev.detail.enabled;
    dataMobile = dataMobile;
  };
</script>

<div class="h-full flex flex-col justify-between">
  <div class={dataMobile ? 'hidden md:block overflow-y-auto' : 'overflow-y-auto'}>
    <SortableList
      list={data}
      key="col_class_ID"
      dragEnabler={(e) => e.col_user_enabled}
      on:sort={(e) => (data = e.detail)}
      let:item
      let:index
    >
      <SortableListItem on:disableChanged={onChange} title={item.col_title} enabled={item.col_user_enabled} {index} />
    </SortableList>
  </div>
  {#if dataMobile}
    <div class="block md:hidden overflow-y-auto">
      <SortableList
        list={dataMobile}
        key="col_class_ID"
        dragEnabler={(e) => e.col_user_enabled}
        on:sort={(e) => (dataMobile = e.detail)}
        let:item
        let:index
      >
        <SortableListItem
          on:disableChanged={onChangeMobile}
          title={item.col_title}
          enabled={item.col_user_enabled}
          {index}
        />
      </SortableList>
    </div>
  {/if}
  <ModalButtonRow class="mt-6" {successBtnText} on:success={() => handleDataOnSuccess()} />
</div>
