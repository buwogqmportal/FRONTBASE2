<script lang="ts" context="module">
  import { idGenerator } from '$baselib/util';

  let ids = idGenerator();
</script>

<script lang="ts">
  // node modules
  import { t, _ } from 'svelte-i18n';
  import Dropzone, { type DropzoneFile } from 'dropzone';

  // svelte
  import { browser } from '$app/env';
  import { onMount, getContext, createEventDispatcher } from 'svelte';
  import type { Writable } from 'svelte/store';

  // lib
  import { type APIFile, APIFileViewRight, FileRequest } from '$baselib/api/file';
  import { fileURL, sessionName } from '$baselib/config';
  import { connectionSend, state, userHasRight } from '$baselib/stores';
  import type { APIResponse } from '$baselib/api';

  // components
  import Annotate from '$components/Annotate/Annotate.svelte';
  import Button from '$components/Form/Button.svelte';
  import ErrorMessage from './ErrorMessage.svelte';
  import ImageExtern from '$components/ImageExtern.svelte';
  import Link from '$components/Link.svelte';
  import ModalAlert from '$components/Modal/ModalAlert.svelte';
  import ModalPdfViewer from '$components/Modal/ModalPDFViewer.svelte';
  import type { FormErrorMessage } from '$components/Form.svelte';
  import type { ModalContext } from '$components/Modal/ModalProvider.svelte';

  // icons
  import CloseIcon from '$icons/close.svg?component';
  import RemovableIcon from '$icons/removable.svg?component';
  import EditIcon from '$icons/edit.svg?component';

  const { open, close } = getContext<ModalContext>('simple-modal');

  class BigDropzone extends Dropzone {
    async _uploadData(files: DropzoneFile[], dataBlocks: any[]) {
      if (files.some((file) => file.size > 5e6)) {
        for (const file of files) {
          const res = await $connectionSend<{ file_ID: string; url: string }>('file/getlargeurl');
          const data = res.success.data;

          const prev = { ...this.options };
          this.options.url = data.url;
          this.options.binaryBody = true;
          this.options.method = 'put';

          let onceSuccess = true;

          function handleSuccess(sfile: DropzoneFile) {
            if (!onceSuccess) return;

            if (file === sfile) {
              const formData = new FormData();
              formData.delete('file');
              formData.append('file_ID', data.file_ID);
              formData.append('file_name', file.name);
              formData.append('file_view_right', viewRight);
              formData.append('file_function', fileFunction);
              if (!submit) {
                formData.append('file_type', fileType);
                formData.append('file_type_ID', fileTypeID);
              }
              $connectionSend('file/setlarge', formData).then((data) => {
                this.emit('success', sfile, data);
              });
              onceSuccess = false;
            }
          }

          this.on('success', handleSuccess);

          super['_uploadData']([file], dataBlocks);

          this.options = prev;
        }
      } else {
        super['_uploadData'](files, dataBlocks);
      }
    }
  }

  let ref: HTMLElement;
  let buttonEl: HTMLElement;
  let id = ids();

  export let submit = false;
  export let name = '';
  export let label = '';
  export let placeholder = '--';
  export let button = '';
  export let viewFiles = true;
  export let deleteFiles = true;
  export let downloadFiles = false;

  export let single = false;

  export let accept = '';

  export let fileType = '';
  export let fileTypeID = '';
  export let viewRight = APIFileViewRight.Users;
  export let fileFunction = '';
  export let PDF = false;

  export let errormsg = '';
  export let showerror = true;
  export let hideZone = false;

  //activates alternative styling for the fileupload used in the chat
  export let useChatStyling = false;

  let class_ = '';
  export { class_ as class };

  type FileData = {
    id: string;
    name: string;
    preview: string;
    file: DropzoneFile;
  };

  export let file = '';
  export let files: string[] = [];
  let filesData: FileData[] = [];

  export let allowAnotation = false;
  export let remove: (remove: (api: boolean) => Promise<void>, file: FileData) => void = submit
    ? (remove) => {
        remove(false);
      }
    : (remove) => {
        open(
          ModalAlert,
          {
            onAccept: () => {
              remove(true);
              close();
            },
            onCancel: () => {
              close();
            },
          },
          {},
        );
      };

  const dispatch = createEventDispatcher();

  function getFileDataByFile(file: DropzoneFile): FileData {
    return filesData.find((f) => f.file === file);
  }

  function getFileDataById(file_ID: string): FileData {
    return filesData.find((f) => f.id === file_ID);
  }

  let dropzone: Dropzone;

  const changedFiles = getContext<Writable<FormErrorMessage>>('formchangedfiles');

  $: if (changedFiles && !single && files) {
    const values = Object.values(fileAPICalls);
    $changedFiles[fileType] = (id: string) => values.map((fn) => fn(id));
  }

  if (browser && fileType && fileTypeID) {
    FileRequest.getFileType(fileType, fileTypeID).then((files) => {
      if (single) {
        files = files.slice(0, 1);
      }

      files = files.filter((f) => !getFileDataById(f.file_ID));

      for (const apiFile of files) {
        const file = addFileFromServer(apiFile);
        const fileData = getFileDataByFile(file);
        fileData.id = apiFile.file_ID;
      }
    });
  }
  $: if (dropzone && browser && $userHasRight('file', 'getinfo')) {
    if (file && single) {
      files = [file];
      loadedFiles = { [file]: loadedFiles[file] };
    } else if (!single && files.length > 0) {
      file = files[1];
    } else if (!single) {
      file = '';
    }

    filesData = filesData.filter((file) => !file.id || files.includes(file.id));

    files
      .filter((file_ID) => !loadedFiles[file_ID])
      .forEach((file_ID) => {
        loadedFiles[file_ID] = true;
        FileRequest.getInfo(file_ID)
          .then((fileInfo) => {
            const file = addFileFromServer(fileInfo);
            const fileData = getFileDataByFile(file);
            fileData.id = file_ID;
          })
          .catch(() => {
            const file = addFileFromServer(file_ID);
            const fileData = getFileDataByFile(file);
            fileData.id = file_ID;
          });
      });
  }

  let loadedFiles = {};

  export function update() {
    filesData = filesData;
    files = filesData.map((file) => file.id).filter((id) => id);
    file = filesData.length ? filesData[filesData.length - 1].id : '';
  }

  onMount(() => {
    dropzone = new BigDropzone(ref, {
      url: `${fileURL}file/set`,
      withCredentials: true,
      disablePreviews: true,
      acceptedFiles: accept,
      uploadMultiple: true,
      maxFiles: single ? 1 : null,
      clickable: buttonEl,
      maxFilesize: 100 /*mb*/,
    });

    dropzone.on('sending', async function (_file, _xhr, formData) {
      if (formData) {
        formData.append(sessionName, $state.session);
        formData.append('file_view_right', viewRight);
        formData.append('file_function', fileFunction);
        if (!submit) {
          formData.append('file_type', fileType);
          formData.append('file_type_ID', fileTypeID);
        }
      }
    });

    dropzone.on('uploadprogress', () => {
      filesData = filesData;
    });

    dropzone.on('success', async function (file1, response) {
      if (!response) return;
      const filenames = (response as APIResponse<Record<string, string>>).success.data;
      const file_ID = filenames[file1.name];

      if (single) {
        file = file_ID;
      } else {
        files.push(file_ID);
      }

      const fileData = getFileDataByFile(file1);
      fileData.id = file_ID;
      fileData.preview = FileRequest.getURL(file_ID);
      loadedFiles[file_ID] = true;

      setFileOnSubmitAdd(file_ID);

      dispatch('upload', { id: file_ID, name: file1.name });
    });

    dropzone.on('addedfile', function (file) {
      const fileData = {
        id: '',
        name: file.name,
        preview: '',
        file,
      };

      if (single) {
        filesData = [fileData];
      } else {
        filesData.push(fileData);
      }
    });

    dropzone.on('thumbnail', function (file, dataURL) {
      const fileData = getFileDataByFile(file);
      fileData.preview = dataURL;
    });

    dropzone.on('complete', function (_file) {
      update();
    });

    dropzone.on('removedfile', function (file) {
      filesData = filesData.filter((f) => f.file !== file);
      update();
    });

    files = files;

    return () => {
      dropzone.destroy();
    };
  });

  function addFileFromServer(data: APIFile | string, createThumbnail = true): DropzoneFile {
    const file_ID = typeof data === 'string' ? data : data.file_ID;
    const filename = typeof data === 'string' ? data : data.file_title || data.file_name || file_ID;
    const extension = typeof data === 'string' ? '' : data.file_extension;

    const url = FileRequest.getURL(file_ID);

    // Create the mock file:
    const file = {
      name: filename,
      dataURL: url,
      size: 1,
      type: extension === 'jpeg' || extension === 'png' || extension === 'webp' ? 'image' : 'application/pdf',
      status: Dropzone.ADDED,
    } as DropzoneFile;

    dropzone.files.push(file);

    file.status = Dropzone.ADDED;

    dropzone.emit('addedfile', file);

    dropzone.emit('success', file, { success: { data: { [filename]: file_ID } } });

    if (createThumbnail) {
      dropzone.createThumbnailFromUrl(
        file,
        120,
        120,
        'crop',
        true,
        function (thumbnail) {
          if (typeof thumbnail === 'string') dropzone.emit('thumbnail', file, thumbnail);
        },
        'Anonymous',
      );
    } else {
      dropzone.emit('thumbnail', file, url);
    }

    // Make sure that there is no progress bar, etc...
    dropzone.emit('complete', file);

    return file;
  }

  function handleAnnotation(file: FileData) {
    open(
      Annotate,
      {
        imageID: file.id,
        onSave: async function (dataURI: string) {
          const newFiles = await FileRequest.uploadBase64(
            {
              ...(!submit ? { file_type: fileType, file_type_ID: fileTypeID } : {}),
              file_view_right: viewRight,
              file_function: fileFunction,
              file_name: file.name,
              file_extension: 'jpeg',
            },
            dataURI,
          );

          if (file.id) {
            removeFileFromDropzone(file, !submit && deleteFiles && $userHasRight('file', 'delete'));
          }

          const file_ID = Object.values(newFiles)[0];
          update();
          files.push(file_ID);
          files = files;
          setFileOnSubmitAdd(file_ID);
        },
      },
      {
        closeButton: false,
        classWindowWrap: 'h-full',
        classWindow: 'w-full h-full m-0 bg-secondary-lighter overflow-hidden',
        classContent: 'w-full h-full',
      },
    );
  }

  function openPDF(url: string | string[]) {
    open(
      ModalPdfViewer,
      {
        url: url,
        onSave: () => {
          close();
        },
      },
      {
        title: $_('modal.pdf_viewer.title'),
        secondaryStyle: true,
        classWindowWrap: 'h-full',
        classWindow: 'w-full h-full m-0 overflow-hidden',
        classContent: 'w-full h-full p-0',
      },
    );
  }

  export async function removeFileFromDropzone(file: FileData, api = true) {
    dropzone.removeFile(file.file);
    delete loadedFiles[file.id];

    if (api) {
      await FileRequest.del(file.id);
    }

    setFileOnSubmitRemove(file.id);

    files = files.filter((file_ID) => file_ID !== file.id);

    dispatch('delete', { id: file.id, name: file.name });
  }

  const fileAPICalls: Record<string, (id: string) => Promise<unknown>> = {};

  function setFileOnSubmitAdd(file_ID: string) {
    fileAPICalls[file_ID] = (id: string) => {
      delete fileAPICalls[file_ID];
      return FileRequest.updateInfo({
        file_ID,
        file_type: fileType,
        file_type_ID: id ?? fileTypeID,
      });
    };
  }

  function setFileOnSubmitRemove(file_ID: string) {
    fileAPICalls[file_ID] = () => {
      delete fileAPICalls[file_ID];
      return FileRequest.del(file_ID);
    };
  }
</script>

<div class={[useChatStyling ? 'flex flex-row items-center relative' : 'mt-5'].join(' ')}>
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label for="file-upload-{id}" class="block text-sm text-secondary disabled:text-secondary-lighter">
    {label}
  </label>

  <div
    class={[
      'min-h-[4rem]',
      'flex flex-col items-center justify-center',
      'p-5 space-y-5',
      'rounded-lg text-secondary/70',
      useChatStyling ? '' : 'mt-3',
      hideZone ? 'hidden' : '',
      errormsg ? 'border border-alert' : 'border border-secondary border-dashed',
      class_,
    ].join(' ')}
    bind:this={ref}
  >
    {#if single}
      <input id="file-upload-{id}" {name} value={file} hidden tabindex="-1" aria-hidden="true" />
    {/if}
    {#if !dropzone || filesData.length === 0}
      <p>{placeholder}</p>
    {:else}
      {#each filesData as file}
        <div class="relative flex-grow w-full ">
          <div class="w-full h-full flex flex-row space-x-4 items-center">
            <ImageExtern class="w-10 h-10 shrink-0 object-cover" src={file.preview} alt="" />
            <p class="flex-grow break-all truncate">{file.name}</p>
            {#if viewFiles}
              <div class="grow-0 flex flex-row justify-between space-x-2">
                {#if PDF}
                  <Button
                    color="primary"
                    on:click={() => {
                      openPDF(file.id);
                    }}
                  >
                    {$_('file.open')}
                  </Button>
                {:else}
                  <Link type="button" color="secondary" href={FileRequest.getURL(file.id)} newTab
                    >{$_('file.open')}</Link
                  >
                {/if}
                {#if downloadFiles}
                  <Link type="button" color="secondary" href={FileRequest.getURL(file.id, { download: true })}
                    >{$_('file.download')}</Link
                  >
                {/if}
              </div>
            {/if}
            {#if allowAnotation && $userHasRight('file', 'set')}
              <button type="button" on:click={() => handleAnnotation(file)}><EditIcon /></button>
            {/if}
            {#if deleteFiles && $userHasRight('file', 'delete')}
              <button type="button" on:click={() => remove((api) => removeFileFromDropzone(file, api), file)}
                ><CloseIcon /></button
              >
            {/if}
          </div>
          {#if file?.file.upload?.progress < 100}
            <div class="absolute inset-x-0 bottom-0">
              <div class="h-1 bg-primary" style="width: {file.file.upload.progress}%;" />
            </div>
          {/if}
        </div>
      {/each}
    {/if}
  </div>
  {#if filesData.length > 0 && deleteFiles && useChatStyling && $userHasRight('file', 'set')}
    <div
      class="text-white cursor-pointer mr-2"
      on:click={() => {
        filesData.forEach((file) => removeFileFromDropzone(file));
        dispatch('removedAll');
      }}
    >
      <RemovableIcon />
    </div>
  {/if}
  {#if button || ($$slots.button && $userHasRight('file', 'set'))}
    <div bind:this={buttonEl}>
      <slot name="button" disabled={!dropzone} {button}>
        <Button color="secondary" class="mt-4" disabled={!dropzone}>{button}</Button>
      </slot>
    </div>
  {/if}

  <ErrorMessage name={name || fileType} msg={errormsg} show={showerror} />
</div>
