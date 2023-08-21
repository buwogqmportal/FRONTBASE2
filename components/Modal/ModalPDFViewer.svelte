<script lang="ts">
  // app
  import { browser } from '$app/env';

  // lib
  import { FileRequest } from '$baselib/api/file';
  import { state } from '$baselib/stores';

  // svelte
  import { onMount } from 'svelte';

  // node modules
  import * as pdfjs from 'pdfjs-dist';
  import { _ } from 'svelte-i18n';

  // components
  import SignaturePad, { emptySignatureController } from '$components/Annotate/SignaturePad.svelte';
  import Button from '$components/Form/Button.svelte';
  import CardDivider from '$components/Card/CardDivider.svelte';
  import Loading from '$components/Loading.svelte';
  import Nodata from '$components/Nodata.svelte';
  import Errorpage from '$components/Errorpage.svelte';

  // icons
  import DocumentIcon from '$icons/document.svg?component';
  import CheckmarkIcon from '$icons/checkmark.svg?component';
  import ErrorIcon from '$icons/close.svg?component';
  import DownloadIcon from '$icons/download.svg?component';
  import SkeletonText from '$components/SkeletonText.svelte';
  import { listToClass, toArray } from '$baselib/util';
  import Badge from '$components/Badge.svelte';
  import type { TransformableState } from '$components/Annotate/transformable';
  import { Transform } from '$components/Annotate/transform';

  // MODEL

  function scaleMap(s: number): number {
    return Math.pow(2, s / 10);
  }

  function scaleUnmap(s: number): number {
    return Math.log2(s) * 10;
  }

  function updateArray<T>(arr: T[], i: number, fn: (element: T) => T): T[] {
    return arr.map((el, j) => (j === i ? fn(el) : el));
  }

  function generateArray<T>(len: number, fn: (i: number) => T): T[] {
    const array = new Array(len);

    for (let i = 0; i < array.length; i++) {
      array[i] = fn(i);
    }

    return array;
  }

  export abstract class DocumentState {
    constructor(public fileID: string) {}
  }

  export class DocumentStateLoading extends DocumentState {}

  export class DocumentStateReady extends DocumentState {
    constructor(fileID: string, public doc: pdfjs.PDFDocumentProxy, public pages: PageState[]) {
      super(fileID);
    }

    get numPages() {
      return this.doc.numPages;
    }

    hasPage(num: number): boolean {
      return Boolean(this.pages[num]);
    }
  }

  export class DocumentStateError extends DocumentState {
    constructor(fileID: string, public error: any) {
      super(fileID);
    }

    copyWith({ fileID, error }: { fileID: string; error: any }): DocumentStateError {
      return new DocumentStateError(fileID ?? this.fileID, error ?? this.error);
    }
  }

  export class DocumentStateSuccess extends DocumentState {
    constructor(
      fileID: string,
      public doc: pdfjs.PDFDocumentProxy,
      public pages: PageState[],
      public transform: Transform,
      public container: HTMLElement,
    ) {
      super(fileID);
    }

    get numPages() {
      return this.doc.numPages;
    }

    hasPage(num: number): boolean {
      return Boolean(this.pages[num]);
    }

    pageNeedsRerender(num: number): boolean {
      const page = this.pages[num];
      return (
        page &&
        (page instanceof PageStateLoaded ||
          (page instanceof PageStateRendering && !page.isValid(this.transform.scale)) ||
          (page instanceof PageStateDone && !page.isValid(this.transform.scale)))
      );
    }
  }

  export abstract class PageState {
    constructor(public num: number) {}
  }

  export class PageStateInitial extends PageState {}

  export class PageStateLoading extends PageState {}

  export class PageStateLoaded extends PageState {
    constructor(num: number, public page: pdfjs.PDFPageProxy) {
      super(num);
    }
  }

  export class PageStateRendering extends PageState {
    constructor(
      num: number,
      public page: pdfjs.PDFPageProxy,
      public scale: number,
      public task: pdfjs.RenderTask,
      public startTime: number,
      public dirty: boolean,
    ) {
      super(num);
    }

    isValid(scale: number): boolean {
      return Math.abs(this.scale - Math.round(scaleUnmap(scale))) >= 1;
    }

    age(): number {
      return Date.now() - this.startTime;
    }
  }

  class PageStateDone extends PageState {
    constructor(num: number, public page: pdfjs.PDFPageProxy, public scale: number) {
      super(num);
    }

    isValid(scale: number): boolean {
      return Math.abs(this.scale - scaleUnmap(scale)) >= 1;
    }
  }

  // INIT

  export let url: string | string[];
  export let enableSigning = false;
  export let warning = '';
  export let onSave: (signature?: string | string[]) => {} = null;
  export let onRead: (fileID: string) => {} = null;
  export let onSign: (fileID: string, image: string) => {} = null;
  export let prename = '';
  export let lastname = '';

  let visiblePage = 0;

  type FileData = {
    title: string;
    extension: string;
    signature?: string;
    read: boolean;
    signed: boolean;
    signed_at: Date;
    state: 'loading' | 'success' | 'error';
  };

  let fileData: Record<string, FileData> = {};
  let mobileMode: 'list' | 'document' | 'signing' = 'list';
  let isLandscape = false;
  let signatureExist = false;
  let windowWidth = 0,
    windowHeight = 0;
  let clear = () => {};

  let canvasContainer: HTMLDivElement;

  if (browser) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
  }

  // UPDATE

  function loadDocument(fileID: string) {
    if (docState) {
      mobileMode = 'document';
    }

    signatureExist = false;

    if (docState instanceof DocumentStateSuccess && docState.fileID === fileID) {
      return;
    }

    if (docState instanceof DocumentStateSuccess) {
      docState = new DocumentStateSuccess(
        fileID,
        docState.doc,
        docState.pages.map((page) => (page instanceof PageStateRendering && page.task.cancel(), page)),
        docState.transform,
        docState.container,
      );
    }

    docState = new DocumentStateLoading(fileID);

    if (enableSigning && Array.isArray(url)) {
      clear();
    }

    const fileURL = FileRequest.getURL(fileID);

    pdfjs
      .getDocument(fileURL)
      .promise.then((doc) => initializeDocument(fileID, doc))
      .catch((err) => failDocument(fileID, err));
  }

  function initializeDocument(fileID: string, doc: pdfjs.PDFDocumentProxy) {
    if (!(docState instanceof DocumentStateLoading) || docState.fileID !== fileID) {
      return;
    }

    docState = new DocumentStateReady(
      fileID,
      doc,
      generateArray(doc.numPages, (i) => new PageStateInitial(i)),
    );

    for (let i = 0; i < doc.numPages; i++) {
      loadPage(fileID, i);
    }

    const data = fileData[fileID];

    if (!data.read) {
      data.read = true;
      onRead?.call(null, fileID);
    }
  }

  function invalidePages(keepContainer = true) {
    if (docState instanceof DocumentStateReady || (!keepContainer && docState instanceof DocumentStateSuccess)) {
      docState = new DocumentStateReady(
        docState.fileID,
        docState.doc,
        docState.pages.map((page) => {
          if (page instanceof PageStateRendering) {
            page.task.cancel();
            return new PageStateLoaded(page.num, page.page);
          }

          if (page instanceof PageStateDone) {
            return new PageStateLoaded(page.num, page.page);
          }

          return page;
        }),
      );
    } else if (docState instanceof DocumentStateSuccess) {
      docState = new DocumentStateSuccess(
        docState.fileID,
        docState.doc,
        docState.pages.map((page) => {
          if (page instanceof PageStateRendering) {
            page.task.cancel();
            return new PageStateLoaded(page.num, page.page);
          }

          if (page instanceof PageStateDone) {
            return new PageStateLoaded(page.num, page.page);
          }

          return page;
        }),
        docState.transform,
        docState.container,
      );
    }
  }

  function setContainer(canvasContainer: HTMLElement) {
    if (!(docState instanceof DocumentStateReady) && !(docState instanceof DocumentStateSuccess)) {
      return;
    }

    if (docState instanceof DocumentStateReady) {
      docState = new DocumentStateSuccess(
        docState.fileID,
        docState.doc,
        docState.pages,
        new Transform(),
        canvasContainer,
      );
    }

    invalidePages();

    updateTransformBounds();

    // typescript is not smart enough to infer a type after setting it
    if (!(docState instanceof DocumentStateSuccess)) {
      return;
    }

    for (const page of docState.pages) {
      renderPage(docState.fileID, page);
    }
  }

  function failDocument(fileID: string, err: any) {
    if (!(docState instanceof DocumentStateLoading) || docState.fileID !== fileID) {
      return;
    }

    docState = new DocumentStateError(fileID, err);
  }

  function loadPage(fileID: string, num: number) {
    if (docState.fileID !== fileID) {
      return;
    }

    if (docState instanceof DocumentStateReady && docState.pages[num] instanceof PageStateInitial) {
      docState = new DocumentStateReady(
        fileID,
        docState.doc,
        updateArray(docState.pages, num, () => new PageStateLoading(num)),
      );
    }

    if (docState instanceof DocumentStateSuccess && docState.pages[num] instanceof PageStateInitial) {
      docState = new DocumentStateSuccess(
        fileID,
        docState.doc,
        updateArray(docState.pages, num, () => new PageStateLoading(num)),
        docState.transform,
        docState.container,
      );
    }

    if (docState instanceof DocumentStateReady || docState instanceof DocumentStateSuccess) {
      docState.doc.getPage(num + 1).then((page) => setPage(fileID, page));
    }
  }

  function setPage(fileID: string, page: pdfjs.PDFPageProxy) {
    const num = page.pageNumber - 1;

    if (docState instanceof DocumentStateReady && docState.pages[num] instanceof PageStateLoading) {
      docState = new DocumentStateReady(
        fileID,
        docState.doc,
        updateArray(docState.pages, num, () => new PageStateLoaded(num, page)),
      );
    }

    if (docState instanceof DocumentStateSuccess && docState.pages[num] instanceof PageStateLoading) {
      docState = new DocumentStateSuccess(
        fileID,
        docState.doc,
        updateArray(docState.pages, num, () => new PageStateLoaded(num, page)),
        docState.transform,
        docState.container,
      );
    }

    if (docState instanceof DocumentStateSuccess) {
      renderPage(fileID, docState.pages[num]);
    }
  }

  function renderPage(fileID: string, page: PageState) {
    const num = page.num;

    if (docState instanceof DocumentStateSuccess && page instanceof PageStateLoaded) {
      for (let i = docState.container.childElementCount; i <= num; i++) {
        const canvas = document.createElement('canvas');
        docState.container.appendChild(canvas);
      }

      const canvas = docState.container.children[num] as HTMLCanvasElement;

      const ctx = canvas.getContext('2d');

      canvas.style.marginLeft = 'auto';
      canvas.style.marginRight = 'auto';
      canvas.style.marginBottom = '1rem';
      canvas.style.display = 'block';

      canvas.style.width = `${page.page.view[2] * docState.transform.scale}px`;
      canvas.style.height = `${page.page.view[3] * docState.transform.scale}px`;

      requestAnimationFrame(() => {
        updateTransformBounds();
      });

      const pageProxy = page.page;
      // const scale = Math.round(scaleUnmap(docState.transform.scale));
      const scale = 0;

      let viewport = pageProxy.getViewport({
        scale: scaleMap(scale) * devicePixelRatio,
      });

      const data = ctx.getImageData(0, 0, canvas.width, canvas.height);

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      ctx.save();

      ctx.scale(canvas.width / data.width, canvas.height / data.height);

      ctx.putImageData(data, 0, 0);

      ctx.restore();

      // Render PDF page into canvas context
      const renderTask = pageProxy.render({
        canvasContext: ctx,
        viewport: viewport,
      });

      docState = new DocumentStateSuccess(
        fileID,
        docState.doc,
        updateArray(docState.pages, num, (page) =>
          page instanceof PageStateLoaded || page instanceof PageStateDone
            ? new PageStateRendering(num, page.page, scale, renderTask, Date.now(), false)
            : page,
        ),
        docState.transform,
        docState.container,
      );

      renderTask.promise.then(() => {
        finishPage(fileID, page);
      });
    } else if (
      docState instanceof DocumentStateSuccess &&
      (page instanceof PageStateRendering || page instanceof PageStateDone)
    ) {
      const canvas = docState.container.children[num] as HTMLCanvasElement;

      canvas.style.width = `${page.page.view[2] * docState.transform.scale}px`;
      canvas.style.height = `${page.page.view[3] * docState.transform.scale}px`;

      docState.container.scrollLeft = -docState.transform.translation[0];
      docState.container.scrollTop = -docState.transform.translation[1];

      requestAnimationFrame(() => {
        updateTransformBounds();
      });
    }
  }

  function finishPage(fileID: string, page: PageState) {
    if (docState instanceof DocumentStateSuccess) {
      if (page instanceof PageStateRendering && page.dirty) {
        docState = new DocumentStateSuccess(
          fileID,
          docState.doc,
          updateArray(docState.pages, page.num, (page) =>
            page instanceof PageStateRendering
              ? new PageStateRendering(page.num, page.page, page.scale, page.task, 0, true)
              : page,
          ),
          docState.transform,
          docState.container,
        );

        renderPage(fileID, page);
      } else {
        docState.container.scrollLeft = -docState.transform.translation[0];
        docState.container.scrollTop = -docState.transform.translation[1];

        docState = new DocumentStateSuccess(
          fileID,
          docState.doc,
          updateArray(docState.pages, page.num, (page) =>
            page instanceof PageStateRendering ? new PageStateDone(page.num, page.page, page.scale) : page,
          ),
          docState.transform,
          docState.container,
        );
      }
    }
  }

  let docState: DocumentState = null;

  $: {
    const newFileData = {};

    for (const fileID of toArray(url).filter(Boolean)) {
      if (fileID in fileData) {
        newFileData[fileID] = fileData[fileID];
      } else {
        const obj = {
          title: '',
          extension: '',
          state: 'loading',
          read: false,
          signed: false,
        };
        newFileData[fileID] = obj;

        FileRequest.getInfo(fileID)
          .then((res) => {
            obj.state = 'success';
            obj.title = res.file_title || res.file_name || obj.title;
            obj.extension = res.file_extension;

            fileData = fileData;
          })
          .catch(() => {
            obj.state = 'error';

            fileData = fileData;
          });
      }
    }

    fileData = newFileData;
  }

  function zoomIn(s = 1.1) {
    if (docState instanceof DocumentStateSuccess) {
      docState.transform.scale *= s;
      docState = new DocumentStateSuccess(
        docState.fileID,
        docState.doc,
        docState.pages,
        docState.transform,
        docState.container,
      );

      rerender();
    }
  }

  function zoomOut(s = 1.1) {
    zoomIn(1 / s);
  }

  function isElementInViewport(el: HTMLElement) {
    var rect = el.getBoundingClientRect();
    var view = canvasContainer.getBoundingClientRect();
    return (rect.top < view.bottom && rect.bottom > view.top) || (rect.bottom > view.top && rect.top < view.bottom);
  }

  function updateVisiblePage() {
    if (!canvasContainer) return;

    for (let i = 0; i < canvasContainer.childElementCount; i++) {
      if (isElementInViewport(canvasContainer.children.item(i) as HTMLElement)) {
        visiblePage = i;
        return;
      }
    }
  }

  function handleOrientationChange() {
    isLandscape = screen.orientation.type.startsWith('landscape');
  }

  $: if (!docState && typeof url === 'string') {
    loadDocument(url);
  } else if (!docState && Array.isArray(url) && url.length > 0) {
    loadDocument(url[0]);
  }

  $: if (canvasContainer) {
    setContainer(canvasContainer);
  } else {
    invalidePages(false);
  }

  function rerender() {
    if (docState instanceof DocumentStateSuccess) {
      for (const page of docState.pages) {
        renderPage(docState.fileID, page);
      }
    }
  }

  onMount(() => {
    if (screen.orientation) {
      screen.orientation.addEventListener('change', handleOrientationChange);
      handleOrientationChange();

      return () => {
        screen.orientation.removeEventListener('change', handleOrientationChange);
      };
    } else {
      isLandscape = true;
    }
  });

  function handleSign() {
    const image = signaturePadController.save();
    signaturePadController.clear();

    fileData[docState.fileID].signed = true;
    fileData[docState.fileID].signed_at = new Date();
    fileData[docState.fileID].signature = image;

    mobileMode = 'list';

    onSign?.call(null, docState.fileID, image);

    if (!Array.isArray(url)) {
      onSave?.call(null, image);
    }
  }

  $: hasReadEveryDocument = Object.values(fileData).every((data) => data.read);
  $: hasSignedEveryDocument = Object.values(fileData).every((data) => data.signed);

  const signaturePadController = emptySignatureController();

  let skipTransform = false;

  let transformableOptions: Partial<TransformableState> = {
    scale: { min: 0.5, max: 2 },
    onTransform(state) {
      if (skipTransform) {
        skipTransform = false;
        return;
      }

      if (docState instanceof DocumentStateSuccess) {
        docState = new DocumentStateSuccess(
          docState.fileID,
          docState.doc,
          docState.pages,
          state.transform,
          docState.container,
        );
        rerender();
      }
    },
    // onResize: console.log,
  };

  function updateTransformBounds() {
    if (docState instanceof DocumentStateSuccess) {
      skipTransform = true;

      let minScale = 1;
      const style = getComputedStyle(docState.container);
      const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);

      for (const page of docState.pages) {
        if (page instanceof PageStateLoaded || page instanceof PageStateRendering || page instanceof PageStateDone) {
          minScale = Math.min(
            minScale,
            (docState.container.clientWidth - paddingX) / page.page.view[2],
            (docState.container.clientHeight - paddingY) / page.page.view[3],
          );
        }
      }

      transformableOptions.scale = {
        min: minScale,
        max: 2,
      };
      transformableOptions.x = {
        min: docState.container.clientWidth - docState.container.scrollWidth,
        max: 0,
      };
      transformableOptions.y = {
        min: docState.container.clientHeight - docState.container.scrollHeight,
        max: 0,
      };
    }
  }
</script>

<svelte:window
  on:resize={() => {
    updateVisiblePage();
    updateTransformBounds();
  }}
  bind:innerWidth={windowWidth}
  bind:innerHeight={windowHeight}
/>

{#if docState && docState instanceof DocumentStateError && docState.error.status === 403}
  <Nodata>
    <svelte:fragment slot="title">{$_('error.insufficient_rights_title')}</svelte:fragment>
    <svelte:fragment slot="text">{$_('error.insufficient_rights_text')}</svelte:fragment>
  </Nodata>
{:else if docState && docState instanceof DocumentStateError}
  <Errorpage />
{:else if mobileMode === 'signing' && !isLandscape}
  <div class="w-full h-full flex flex-col justify-center items-center bg-secondary-lighter">
    <p>{$_('modal.pdf_viewer.sign_rotated')}</p>
  </div>
{:else if mobileMode === 'signing'}
  <div class="w-full h-full p-4 flex flex-col bg-secondary-lighter space-y-4">
    <SignaturePad
      controller={signaturePadController}
      width="w-full"
      height="h-full"
      text={$_('modal.pdf_viewer.signature', {
        values: {
          file: fileData[docState.fileID].title,
          prename: prename || lastname ? prename : $state.user.user_personal_prename,
          lastname: prename || lastname ? lastname : $state.user.user_personal_lastname,
        },
      })}
      on:endStroke={() => (signatureExist = true)}
    />
    <div class="flex flex-row space-x-4">
      <Button class="flex-1" color="secondary" on:click={() => (mobileMode = 'document')}
        >{$_('modal.pdf_viewer.cancel')}</Button
      >
      <Button
        class="flex-1"
        color="white"
        on:click={() => {
          signaturePadController.clear();
          signatureExist = false;
        }}>{$_('modal.pdf_viewer.undo')}</Button
      >
      <Button class="flex-1" on:click={handleSign} disabled={!signatureExist}>{$_('modal.pdf_viewer.save')}</Button>
    </div>
  </div>
{:else}
  <div class="flex flex-row w-full h-full">
    <div
      class="{mobileMode === 'document' || (!Array.isArray(url) && mobileMode === 'list')
        ? 'flex'
        : 'hidden'} menu:flex flex-col grow bg-secondary-light"
    >
      {#if docState && (docState instanceof DocumentStateReady || docState instanceof DocumentStateSuccess)}
        <div class="relative grow shrink-0">
          <div class="absolute inset-0 overflow-auto p-4" bind:this={canvasContainer} />

          {#if Array.isArray(url)}
            <Badge
              type="round"
              clickable
              class="absolute top-2 left-2 bg-secondary text-white"
              on:click={() => (mobileMode = 'list')}>{$_('modal.pdf_viewer.back_to_list')}</Badge
            >
          {/if}

          <div
            class="absolute bottom-0 left-1/2 -translate-x-1/2 bg-secondary text-secondary-lighter rounded-full mb-10"
          >
            <div class="flex flex-row items-center px-2 py-1.5">
              <span class="px-2">{visiblePage + 1} / {docState.numPages}</span>
              <button class="w-6" on:click={() => zoomOut()}> - </button>
              <button class="w-6" on:click={() => zoomIn()}> + </button>
              {#if typeof url === 'string'}
                <a href={FileRequest.getURL(url) + '&download=1'} class="text-secondary-lighter">
                  <DownloadIcon class="w-6" />
                </a>
              {/if}
            </div>
          </div>
        </div>
        {#if enableSigning && !fileData[docState.fileID].signed}
          <div class="shrink-0 p-6 bg-secondary-lighter hidden menu:flex flex-row justify-center space-x-4">
            <SignaturePad
              controller={signaturePadController}
              width="w-full max-w-xl"
              text={$_('modal.pdf_viewer.signature', {
                values: {
                  file: fileData[docState.fileID].title,
                  prename: prename || lastname ? prename : $state.user.user_personal_prename,
                  lastname: prename || lastname ? lastname : $state.user.user_personal_lastname,
                },
              })}
              on:endStroke={() => (signatureExist = true)}
            />
            <div class="flex flex-col space-y-4">
              <Button
                class="flex-1 whitespace-pre-line"
                color="white"
                disabled={!signatureExist}
                on:click={() => {
                  signaturePadController.clear();
                  signatureExist = false;
                }}>{$_('modal.pdf_viewer.undo')}</Button
              >
              <Button class="flex-1 whitespace-pre-line" disabled={!signatureExist} on:click={handleSign}
                >{$_('modal.pdf_viewer.save')}</Button
              >
            </div>
          </div>
          <div class="p-4 menu:hidden">
            <Button on:click={() => (mobileMode = 'signing')}>{$_('modal.pdf_viewer.sign')}</Button>
          </div>
        {:else if enableSigning}
          <p class="text-secondary/70 text-center p-12">{$_('modal.pdf_viewer.sign_confirmation')}</p>
        {/if}
      {:else}
        <Loading />
      {/if}
    </div>
    {#if Array.isArray(url)}
      <div
        class="{mobileMode === 'list' ? 'block' : 'hidden'} w-full menu:block menu:w-80 p-6 space-y-5 overflow-y-auto"
      >
        <div class="mb-1">
          {$_('modal.pdf_viewer.documents')}
        </div>

        {#each url as fileID}
          {@const data = fileData[fileID]}
          <div class="flex flex-row items-center">
            <button
              class={['grow flex flex-row items-center', docState?.fileID === fileID && 'menu:text-primary'].reduce(
                listToClass,
              )}
              on:click={() => {
                loadDocument(fileID);
              }}
            >
              <div class="w-10 h-10 shrink-0 relative mr-2 {data.state === 'error' ? 'text-alert' : ''}">
                <DocumentIcon class="w-10 h-10" />
                {#if data.state === 'error'}
                  <ErrorIcon class="w-4 h-4 absolute top-0 right-0" style="stroke: white; stroke-width: 3px" />
                  <ErrorIcon class="w-4 h-4 absolute top-0 right-0" />
                {:else if enableSigning ? data.signed : data.read}
                  <CheckmarkIcon class="w-4 h-4 absolute top-0 right-0" style="stroke: white; stroke-width: 3px" />
                  <CheckmarkIcon class="w-4 h-4 absolute top-0 right-0" />
                {/if}
              </div>

              {#if data.state === 'success'}
                {data.title}
              {:else if data.state === 'error'}
                {fileID}
              {:else}
                <SkeletonText />
              {/if}
            </button>
            <a
              href={FileRequest.getURL(fileID, { download: true })}
              class="ml-2 text-secondary hover:text-primary shrink-0"
            >
              <DownloadIcon />
            </a>
          </div>
        {/each}

        {#if warning}
          <CardDivider />

          <div class="flex flex-col">
            <div class="mb-1">
              {$_('modal.pdf_viewer.warning')}
            </div>
            <p class="font-bold">
              {warning}
            </p>
          </div>
        {/if}

        <CardDivider />

        <Button
          on:click={() =>
            onSave?.call(
              null,
              enableSigning
                ? Array.isArray(url)
                  ? Object.values(fileData).map((data) => data.signature)
                  : fileData[url].signature
                : null,
            )}
          disabled={enableSigning ? !hasSignedEveryDocument : !hasReadEveryDocument}
          >{$_('modal.pdf_viewer.read')}</Button
        >
      </div>
    {/if}
  </div>
{/if}
