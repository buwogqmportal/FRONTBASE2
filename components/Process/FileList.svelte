<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // lib
  import { type APIFile, FileRequest } from '$baselib/api/file';
  import { connectionSend } from '$baselib/stores';
  import { toArray } from '$baselib/util';

  // components
  import Image from '$components/Image.svelte';
  import Link from '$components/Link.svelte';
  import SkeletonText from '$components/SkeletonText.svelte';

  export let files: (string | (Partial<APIFile> & { file_ID: string }))[] = [];
  export let hideOpen = false;
  export let hideDownload = false;

  let effectiveFiles: { id: string; title: string }[] = [];
  let loading: Record<string, boolean> = {};

  $: {
    effectiveFiles = toArray(files).map((file) =>
      typeof file === 'string'
        ? { id: file, title: effectiveFiles.find((f) => f.id === file)?.title || '' }
        : { id: file.file_ID, title: file.file_title ?? file.file_name },
    );

    for (const file of effectiveFiles.filter((file) => !file.title && !loading[file.id])) {
      loading[file.id] = true;

      $connectionSend<APIFile>('file/getinfo', { file_ID: file.id })
        .then((data) => {
          if (data.success) {
            effectiveFiles.find((f) => f.id === file.id).title =
              data.success.data.file_title ||
              data.success.data.file_name ||
              $_('file.untitled', { default: 'Unbenannt' });
            effectiveFiles = effectiveFiles;
            delete loading[file.id];
            loading = loading;
          }
        })
        .catch(() => {});
    }
  }
</script>

<div
  class={[
    'min-h-[4rem]',
    'flex flex-col items-center justify-center',
    'p-5 space-y-5',
    'rounded-lg text-secondary/70',
    'border border-secondary border-dashed',
  ].join(' ')}
>
  {#each effectiveFiles as file}
    <div class="relative flex-grow w-full">
      <div class="w-full h-full flex flex-row space-x-4 items-center">
        <Image class="w-10 h-10 shrink-0 object-cover" id={file.id} alt="" />
        <p class="flex-grow break-all truncate">
          {#if !loading[file.id]} {file.title} {:else} <SkeletonText random /> {/if}
        </p>
        <div class="grow-0 flex flex-row justify-between space-x-2">
          {#if !hideOpen}
            <Link type="button" color="secondary" href={FileRequest.getURL(file.id)} newTab>{$_('file.open')}</Link>
          {/if}
          {#if !hideDownload}
            <Link type="button" color="secondary" href={FileRequest.getURL(file.id, { download: true })}
              >{$_('file.download')}</Link
            >
          {/if}
        </div>
      </div>
    </div>
  {/each}
</div>
