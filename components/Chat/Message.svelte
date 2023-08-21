<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // svelte

  // lib
  import { type APIFile, FileRequest } from '$baselib/api/file';
  import { listToClass, toArray } from '$baselib/util';

  // components
  import Link from '$components/Link.svelte';
  import Profilpic from '$components/Profilpic.svelte';

  // icons
  import DocumentIcon from '$icons/document.svg?component';

  let class_ = '';
  export { class_ as class };
  export let received = false;
  export let picture = true;
  export let owner_name = '';
  export let id: string;
  export let attachments: APIFile[] = [];
  export let hideMessage = false;

  $: attachments = toArray(attachments);
</script>

<div class={['c-chat-message', received && 's-received', picture && 's-picture'].reduce(listToClass)}>
  <div class="flex flex-col min-w-0 menu:max-w-[80%] {received ? 'items-start' : 'items-end'} space-y-2">
    {#if !hideMessage}
      <div
        class={['c-chat-message-bubble', picture && attachments.length === 0 && 's-last', class_].reduce(listToClass)}
      >
        <div class="min-w-0 grow break-words">
          <span class="text-sm mr-2 whitespace-pre-line"><slot name="value" /></span>
          <span class="c-chat-message-time">
            <slot name="time" />
          </span>
        </div>
      </div>
    {/if}
    {#if attachments.length > 0}
      <div class={['c-chat-message-bubble flex-col', picture && 's-last', class_].reduce(listToClass)}>
        {#each attachments as file, i}
          <div class="flex flex-row items-center space-x-3">
            <DocumentIcon class="shrink-0 w-6" />

            <Link
              color={received ? 'primary' : 'white'}
              href={FileRequest.getURL(file.file_ID)}
              newTab
              class="lg:hidden grow truncate text-sm underline"
            >
              {file.file_name}
            </Link>

            <p class="hidden lg:inline grow truncate text-sm">{file.file_name}</p>

            <div class="hidden lg:block">
              <Link
                color={received ? 'primary' : 'white'}
                class="underline"
                href={FileRequest.getURL(file.file_ID)}
                newTab>{$_('chat.attachment_open')}</Link
              >
            </div>
          </div>
        {/each}

        <div class="c-chat-message-time ml-auto">
          <slot name="time" />
        </div>
      </div>
    {/if}
  </div>
  {#if picture}
    <div class="block menu:hidden mt-2 {received ? 'self-start' : 'self-end'}">
      <Profilpic theme={received ? 'light' : 'dark'} {owner_name} {id} size={'small'} />
    </div>
    <div class="hidden menu:block mt-2 shrink-0">
      <Profilpic tooltip theme={received ? 'light' : 'dark'} {owner_name} {id} size={'normal'} />
    </div>
  {/if}
</div>
