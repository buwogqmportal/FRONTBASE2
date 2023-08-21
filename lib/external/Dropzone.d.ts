declare module 'dropzone' {
  export type DropzoneOptions = {
    /**
     * Has to be specified on elements other than form (or when the form doesn't
     * have an `action` attribute).
     *
     * You can also provide a function that will be called with `files` and
     * `dataBlocks`  and must return the url as string.
     */
    url: ((files: DropzoneFile[]) => string) | string;

    /**
     * Can be changed to `"put"` if necessary. You can also provide a function
     * that will be called with `files` and must return the method (since `v3.12.0`).
     */
    method: ((files: DropzoneFile[]) => string) | string;

    /**
     * Will be set on the XHRequest.
     */
    withCredentials: boolean;

    /**
     * The timeout for the XHR requests in milliseconds (since `v4.4.0`).
     * If set to null or 0, no timeout is going to be set.
     */
    timeout: number;

    /**
     * How many file uploads to process in parallel (See the
     * Enqueuing file uploads documentation section for more info)
     */
    parallelUploads: number;

    /**
     * Whether to send multiple files in one request. If
     * this it set to true, then the fallback file input element will
     * have the `multiple` attribute as well. This option will
     * also trigger additional events (like `processingmultiple`). See the events
     * documentation section for more information.
     */
    uploadMultiple: boolean;

    /**
     * Whether you want files to be uploaded in chunks to your server. This can't be
     * used in combination with `uploadMultiple`.
     *
     * See [chunksUploaded](#config-chunksUploaded) for the callback to finalise an upload.
     */
    chunking: boolean;

    /**
     * If `chunking` is enabled, this defines whether **every** file should be chunked,
     * even if the file size is below chunkSize. This means, that the additional chunk
     * form data will be submitted and the `chunksUploaded` callback will be invoked.
     */
    forceChunking: boolean;

    /**
     * If `chunking` is `true`, then this defines the chunk size in bytes.
     */
    chunkSize: number;

    /**
     * If `true`, the individual chunks of a file are being uploaded simultaneously.
     */
    parallelChunkUploads: boolean;

    /**
     * Whether a chunk should be retried if it fails.
     */
    retryChunks: boolean;

    /**
     * If `retryChunks` is true, how many times should it be retried.
     */
    retryChunksLimit: number;

    /**
     * The maximum filesize (in MiB) that is allowed to be uploaded.
     */
    maxFilesize: number;

    /**
     * The name of the file param that gets transferred.
     * **NOTE**: If you have the option  `uploadMultiple` set to `true`, then
     * Dropzone will append `[]` to the name.
     */
    paramName: string;

    /**
     * Whether thumbnails for images should be generated
     */
    createImageThumbnails: boolean;

    /**
     * In MB. When the filename exceeds this limit, the thumbnail will not be generated.
     */
    maxThumbnailFilesize: number;

    /**
     * If `null`, the ratio of the image will be used to calculate it.
     */
    thumbnailWidth: number;

    /**
     * The same as `thumbnailWidth`. If both are null, images will not be resized.
     */
    thumbnailHeight: number;

    /**
     * How the images should be scaled down in case both, `thumbnailWidth` and `thumbnailHeight` are provided.
     * Can be either `contain` or `crop`.
     */
    thumbnailMethod: 'contain' | 'crop';

    /**
     * If set, images will be resized to these dimensions before being **uploaded**.
     * If only one, `resizeWidth` **or** `resizeHeight` is provided, the original aspect
     * ratio of the file will be preserved.
     *
     * The `options.transformFile` function uses these options, so if the `transformFile` function
     * is overridden, these options don't do anything.
     */
    resizeWidth: number;

    /**
     * See `resizeWidth`.
     */
    resizeHeight: number;

    /**
     * The mime type of the resized image (before it gets uploaded to the server).
     * If `null` the original mime type will be used. To force jpeg, for example, use `image/jpeg`.
     * See `resizeWidth` for more information.
     */
    resizeMimeType: string;

    /**
     * The quality of the resized images. See `resizeWidth`.
     */
    resizeQuality: number;

    /**
     * How the images should be scaled down in case both, `resizeWidth` and `resizeHeight` are provided.
     * Can be either `contain` or `crop`.
     */
    resizeMethod: 'contain' | 'crop';

    /**
     * The base that is used to calculate the **displayed** filesize. You can
     * change this to 1024 if you would rather display kibibytes, mebibytes,
     * etc... 1024 is technically incorrect, because `1024 bytes` are `1 kibibyte`
     * not `1 kilobyte`. You can change this to `1024` if you don't care about
     * validity.
     */
    filesizeBase: number;

    /**
     * If not `null` defines how many files this Dropzone handles. If it exceeds,
     * the event `maxfilesexceeded` will be called. The dropzone element gets the
     * class `dz-max-files-reached` accordingly so you can provide visual
     * feedback.
     */
    maxFiles: number;

    /**
     * An optional object to send additional headers to the server. Eg:
     * `{ "My-Awesome-Header": "header value" }`
     */
    headers: { [key: string]: string };

    /**
     * Should the default headers be set or not?
     * Accept: application/json <- for requesting json response
     * Cache-Control: no-cache <- Request shouldnt be cached
     * X-Requested-With: XMLHttpRequest <- We sent the request via XMLHttpRequest
     */
    defaultHeaders: boolean;

    /**
     * If `true`, the dropzone element itself will be clickable, if `false`
     * nothing will be clickable.
     *
     * You can also pass an HTML element, a CSS selector (for multiple elements)
     * or an array of those. In that case, all of those elements will trigger an
     * upload when clicked.
     */
    clickable: boolean | string | HTMLElement | string[] | HTMLElement[];

    /**
     * Whether hidden files in directories should be ignored.
     */
    ignoreHiddenFiles: boolean;

    /**
     * The default implementation of `accept` checks the file's mime type or
     * extension against this list. This is a comma separated list of mime
     * types or file extensions.
     *
     * Eg.: `image/*,application/pdf,.psd`
     *
     * If the Dropzone is `clickable` this option will also be used as
     * [`accept`](https://developer.mozilla.org/en-US/docs/HTML/Element/input#attr-accept)
     * parameter on the hidden file input as well.
     */
    acceptedFiles: string;

    /**
     * If false, files will be added to the queue but the queue will not be
     * processed automatically.
     * This can be useful if you need some additional user input before sending
     * files (or if you want want all files sent at once).
     * If you're ready to send the file simply call `myDropzone.processQueue()`.
     *
     * See the [enqueuing file uploads](#enqueuing-file-uploads) documentation
     * section for more information.
     */
    autoProcessQueue: boolean;

    /**
     * If false, files added to the dropzone will not be queued by default.
     * You'll have to call `enqueueFile(file)` manually.
     */
    autoQueue: boolean;

    /**
     * If `true`, this will add a link to every file preview to remove or cancel (if
     * already uploading) the file. The `dictCancelUpload`, `dictCancelUploadConfirmation`
     * and `dictRemoveFile` options are used for the wording.
     */
    addRemoveLinks: boolean;

    /**
     * Defines where to display the file previews – if `null` the
     * Dropzone element itself is used. Can be a plain `HTMLElement` or a CSS
     * selector. The element should have the `dropzone-previews` class so
     * the previews are displayed properly.
     */
    previewsContainer: HTMLElement | string;

    /**
     * Set this to `true` if you don't want previews to be shown.
     */
    disablePreviews: boolean;

    /**
     * This is the element the hidden input field (which is used when clicking on the
     * dropzone to trigger file selection) will be appended to. This might
     * be important in case you use frameworks to switch the content of your page.
     *
     * Can be a selector string, or an element directly.
     */
    hiddenInputContainer: HTMLElement | string;

    /**
     * If null, no capture type will be specified
     * If camera, mobile devices will skip the file selection and choose camera
     * If microphone, mobile devices will skip the file selection and choose the microphone
     * If camcorder, mobile devices will skip the file selection and choose the camera in video mode
     * On apple devices multiple must be set to false.  AcceptedFiles may need to
     * be set to an appropriate mime type (e.g. "image/*", "audio/*", or "video/*").
     */
    capture: string;

    /**
     * A function that is invoked before the file is uploaded to the server and renames the file.
     * This function gets the `File` as argument and can use the `file.name`. The actual name of the
     * file that gets used during the upload can be accessed through `file.upload.filename`.
     */
    renameFile: (DropzoneFile) => void;

    /**
     * If `true` the fallback will be forced. This is very useful to test your server
     * implementations first and make sure that everything works as
     * expected without dropzone if you experience problems, and to test
     * how your fallbacks will look.
     */
    forceFallback: boolean;

    /**
     * The text used before any files are dropped.
     */
    dictDefaultMessage: string;

    /**
     * The text that replaces the default message text it the browser is not supported.
     */
    dictFallbackMessage: string;

    /**
     * The text that will be added before the fallback form.
     * If you provide a  fallback element yourself, or if this option is `null` this will
     * be ignored.
     */
    dictFallbackText: string;

    /**
     * If the filesize is too big.
     * `{{filesize}}` and `{{maxFilesize}}` will be replaced with the respective configuration values.
     */
    dictFileTooBig: string;

    /**
     * If the file doesn't match the file type.
     */
    dictInvalidFileType: string;

    /**
     * If the server response was invalid.
     * `{{statusCode}}` will be replaced with the servers status code.
     */
    dictResponseError: string;

    /**
     * If `addRemoveLinks` is true, the text to be used for the cancel upload link.
     */
    dictCancelUpload: string;

    /**
     * The text that is displayed if an upload was manually canceled
     */
    dictUploadCanceled: string;

    /**
     * If `addRemoveLinks` is true, the text to be used for confirmation when cancelling upload.
     */
    dictCancelUploadConfirmation: string;

    /**
     * If `addRemoveLinks` is true, the text to be used to remove a file.
     */
    dictRemoveFile: string;

    /**
     * If this is not null, then the user will be prompted before removing a file.
     */
    dictRemoveFileConfirmation: string;

    /**
     * Displayed if `maxFiles` is st and exceeded.
     * The string `{{maxFiles}}` will be replaced by the configuration value.
     */
    dictMaxFilesExceeded: string;

    /**
     * Allows you to translate the different units. Starting with `tb` for terabytes and going down to
     * `b` for bytes.
     */
    dictFileSizeUnits: { tb: string; gb: string; mb: string; kb: string; b: string };
    /**
     * Called when dropzone initialized
     * You can add event listeners here
     */
    init: () => void;

    /**
     * Can be an **object** of additional parameters to transfer to the server, **or** a `Function`
     * that gets invoked with the `files`, `xhr` and, if it's a chunked upload, `chunk` arguments. In case
     * of a function, this needs to return a map.
     *
     * The default implementation does nothing for normal uploads, but adds relevant information for
     * chunked uploads.
     *
     * This is the same as adding hidden input fields in the form element.
     */
    params: (
      files: DropzoneFile,
      xhr: XMLHttpRequest,
      chunk: { file: DropzoneFile; index: number },
    ) => {
      dzuuid: string;
      dzchunkindex: number;
      dztotalfilesize: number;
      dzchunksize: number;
      dztotalchunkcount: number;
      dzchunkbyteoffset: number;
    };

    /**
     * A function that gets a [file](https://developer.mozilla.org/en-US/docs/DOM/File)
     * and a `done` function as parameters.
     *
     * If the done function is invoked without arguments, the file is "accepted" and will
     * be processed. If you pass an error message, the file is rejected, and the error
     * message will be displayed.
     * This function will not be called if the file is too big or doesn't match the mime types.
     */
    accept: <T = undefined>(file: DropzoneFile, done: (error?: string) => T) => T;

    /**
     * The callback that will be invoked when all chunks have been uploaded for a file.
     * It gets the file for which the chunks have been uploaded as the first parameter,
     * and the `done` function as second. `done()` needs to be invoked when everything
     * needed to finish the upload process is done.
     */
    chunksUploaded: (file: DropzoneFile, done: () => void) => void;

    /**
     * Sends the file as binary blob in body instead of form data.
     * If this is set, the `params` option will be ignored.
     * It's an error to set this to `true` along with `uploadMultiple` since
     * multiple files cannot be in a single binary body.
     */
    binaryBody: boolean;

    /**
     * Gets called when the browser is not supported.
     * The default implementation shows the fallback input field and adds
     * a text.
     */
    fallback: () => HTMLElement;

    /**
     * Gets called to calculate the thumbnail dimensions.
     *
     * It gets `file`, `width` and `height` (both may be `null`) as parameters and must return an object containing:
     *
     *  - `srcWidth` & `srcHeight` (required)
     *  - `trgWidth` & `trgHeight` (required)
     *  - `srcX` & `srcY` (optional, default `0`)
     *  - `trgX` & `trgY` (optional, default `0`)
     *
     * Those values are going to be used by `ctx.drawImage()`.
     */
    resize: (
      file: DropzoneFile,
      width: number,
      height: number,
      resizeMethod: 'crop' | 'contain',
    ) => {
      srcX: number;
      srcY: number;
      srcWidth: number;
      srcHeight: number;
      trgWidth: number;
      trgHeight: number;
    };

    /**
     * Can be used to transform the file (for example, resize an image if necessary).
     *
     * The default implementation uses `resizeWidth` and `resizeHeight` (if provided) and resizes
     * images according to those dimensions.
     *
     * Gets the `file` as the first parameter, and a `done()` function as the second, that needs
     * to be invoked with the file when the transformation is done.
     */
    transformFile: <T = void>(file: DropzoneFile, done: (file: DropzoneFile) => T) => T;

    /**
     * A string that contains the template used for each dropped
     * file. Change it to fulfill your needs but make sure to properly
     * provide all elements.
     *
     * If you want to use an actual HTML element instead of providing a String
     * as a config option, you could create a div with the id `tpl`,
     * put the template inside it and provide the element like this:
     *
     *     document
     *       .querySelector('#tpl')
     *       .innerHTML
     *
     */
    previewTemplate: string;

    /*
   Those functions register themselves to the events on init and handle all
   the user interface specific stuff. Overwriting them won't break the upload
   but can break the way it's displayed.
   You can overwrite them if you don't like the default behavior. If you just
   want to add an additional event handler, register it on the dropzone object
   and don't overwrite those options.
   */

    // Those are self explanatory and simply concern the DragnDrop.
    drop: (e: DragEvent) => void;
    dragstart: (e: DragEvent) => void;
    dragend: (e: DragEvent) => void;
    dragenter: (e: DragEvent) => void;
    dragover: (e: DragEvent) => void;
    dragleave: (e: DragEvent) => void;

    // Called whenever there are no files left in the dropzone anymore, and the
    // dropzone should be displayed as if in the initial state.
    reset: () => void;

    // Called when a file is added to the queue
    // Receives `file`
    addedfile: (file: DropzoneFile) => T;

    addedfiles: (files: DropzoneFile[]) => T;

    // Called whenever a file is removed.
    removedfile: (file: DropzoneFile) => T;

    // Called when a thumbnail has been generated
    // Receives `file` and `dataUrl`
    thumbnail: (file: DropzoneFile, dataUrl: string) => void;

    // Called whenever an error occurs
    // Receives `file` and `message`
    error: (file: DropzoneFile, message: string, xhr: XMLHttpRequest) => void;

    errormultiple: (files: DropzoneFile[], message: string, xhr: XMLHttpRequest) => void;

    // Called when a file gets processed. Since there is a cue, not all added
    // files are processed immediately.
    // Receives `file`
    processing: (file: DropzoneFile) => void;

    processingmultiple: (files: DropzoneFile[]) => void;

    // Called whenever the upload progress gets updated.
    // Receives `file`, `progress` (percentage 0-100) and `bytesSent`.
    // To get the total number of bytes of the file, use `file.size`
    uploadprogress: (file: DropzoneFile, progress: number, bytesSent: number) => void;

    // Called whenever the total upload progress gets updated.
    // Called with totalUploadProgress (0-100), totalBytes and totalBytesSent
    totaluploadprogress: (totalProgress: number, totalBytes: number, totalBytesSent: number) => void;

    // Called just before the file is sent. Gets the `xhr` object as second
    // parameter, so you can modify it (for example to add a CSRF token) and a
    // `formData` object to add additional information.
    sending: (file: DropzoneFile, xhr: XMLHttpRequest, formData?: FormData) => void;

    sendingmultiple: (files: DropzoneFile[], xhr: XMLHttpRequest, formData?: FormData) => void;

    // When the complete upload is finished and successful
    // Receives `file`
    success: (file: DropzoneFile, responseText: unknown, e?: Event) => void;

    successmultiple: (file: DropzoneFile, responseText: unknown, e?: Event) => void;

    // When the upload is canceled.
    canceled: (file: DropzoneFile) => void;

    canceledmultiple: (files: DropzoneFile[]) => void;

    // When the upload is finished, either with success or an error.
    // Receives `file`
    complete: (file: DropzoneFile) => void;

    completemultiple: (files: DropzoneFile[]) => void;

    maxfilesexceeded: (file: DropzoneFile) => void;

    maxfilesreached: (files: DropzoneFile[]) => void;

    queuecomplete: () => void;
  };

  export default class Dropzone {
    on(event: 'drop', handler: (e: DragEvent) => void): void;
    on(event: 'dragstart', handler: (e: DragEvent) => void): void;
    on(event: 'dragend', handler: (e: DragEvent) => void): void;
    on(event: 'dragenter', handler: (e: DragEvent) => void): void;
    on(event: 'dragover', handler: (e: DragEvent) => void): void;
    on(event: 'dragleave', handler: (e: DragEvent) => void): void;

    on(event: 'addedfile', handler: (file: DropzoneFile) => T): void;
    on(event: 'addedfiles', handler: (files: DropzoneFile[]) => T): void;
    on(event: 'removedfile', handler: (file: DropzoneFile) => T): void;
    on(event: 'thumbnail', handler: (file: DropzoneFile, dataUrl: string) => void): void;
    on(event: 'error', handler: (file: DropzoneFile, message: string, xhr: XMLHttpRequest) => void): void;
    on(event: 'errormultiple', handler: (files: DropzoneFile[], message: string, xhr: XMLHttpRequest) => void): void;
    on(event: 'processing', handler: (file: DropzoneFile) => void): void;
    on(event: 'processingmultiple', handler: (files: DropzoneFile[]) => void): void;
    on(event: 'uploadprogress', handler: (file: DropzoneFile, progress: number, bytesSent: number) => void): void;
    on(
      event: 'totaluploadprogress',
      handler: (totalProgress: number, totalBytes: number, totalBytesSent: number) => void,
    ): void;
    on(event: 'sending', handler: (file: DropzoneFile, xhr: XMLHttpRequest, formData?: FormData) => void): void;
    on(
      event: 'sendingmultiple',
      handler: (files: DropzoneFile[], xhr: XMLHttpRequest, formData?: FormData) => void,
    ): void;
    on(event: 'success', handler: (file: DropzoneFile, responseText: unknown, e?: Event) => void): void;
    on(event: 'successmultiple', handler: (file: DropzoneFile[], responseText: unknown, e?: Event) => void): void;
    on(event: 'canceled', handler: (file: DropzoneFile) => void): void;
    on(event: 'canceledmultiple', handler: (files: DropzoneFile[]) => void): void;
    on(event: 'complete', handler: (file: DropzoneFile) => void): void;
    on(event: 'completemultiple', handler: (files: DropzoneFile[]) => void): void;
    on(event: 'reset', handler: () => void): void;
    on(event: 'maxfilesexceeded', handler: (file: DropzoneFile) => void): void;
    on(event: 'maxfilesreached', handler: (files: DropzoneFile[]) => void): void;
    on(event: 'queuecomplete', handler: () => void): void;

    emit(event: 'drop', e: DragEvent): void;
    emit(event: 'dragstart', e: DragEvent): void;
    emit(event: 'dragend', e: DragEvent): void;
    emit(event: 'dragenter', e: DragEvent): void;
    emit(event: 'dragover', e: DragEvent): void;
    emit(event: 'dragleave', e: DragEvent): void;

    emit(event: 'addedfile', file: DropzoneFile): void;
    emit(event: 'addedfiles', files: DropzoneFile): void;
    emit(event: 'removedfile', file: DropzoneFile): void;
    emit(event: 'thumbnail', file: DropzoneFile, dataUrl: string): void;
    emit(event: 'error', file: DropzoneFile, message: string, xhr: XMLHttpRequest): void;
    emit(event: 'errormultiple', files: DropzoneFile[], message: string, xhr: XMLHttpRequest): void;
    emit(event: 'processing', file: DropzoneFile): void;
    emit(event: 'processingmultiple', files: DropzoneFile[]): void;
    emit(event: 'uploadprogress', file: DropzoneFile, progress: number, bytesSent: number): void;
    emit(event: 'totaluploadprogress', totalProgress: number, totalBytes: number, totalBytesSent: number): void;
    emit(event: 'sending', file: DropzoneFile, xhr: XMLHttpRequest, formData?: FormData): void;
    emit(event: 'sendingmultiple', files: DropzoneFile[], xhr: XMLHttpRequest, formData?: FormData): void;
    emit(event: 'success', file: DropzoneFile, responseText: unknown, e?: Event): void;
    emit(event: 'successmultiple', file: DropzoneFile[], responseText: unknown, e?: Event): void;
    emit(event: 'canceled', file: DropzoneFile): void;
    emit(event: 'canceledmultiple', files: DropzoneFile[]): void;
    emit(event: 'complete', file: DropzoneFile): void;
    emit(event: 'completemultiple', files: DropzoneFile[]): void;
    emit(event: 'reset'): void;
    emit(event: 'maxfilesexceeded', file: DropzoneFile): void;
    emit(event: 'maxfilesreached', files: DropzoneFile[]): void;
    emit(event: 'queuecomplete'): void;

    element: HTMLElement;
    clickableElements: HTMLElement[];
    listeners: {
      element: HTMLElement;
      events: { [event: string]: (...args: unknown) => unknown };
    }[];
    files: DropzoneFile[];
    options: DropzoneOptions;
    previewsContainer?: HTMLElement;
    clickableElements?: HTMLElement[];
    hiddenFileInput: HTMLInputElement;
    disabled?: boolean;

    constructor(el: string | HTMLElement, options: Partial<DropzoneOptions>);

    /**
     * Returns all files that have been accepted
     */
    getAcceptedFiles(): DropzoneFile[];

    /**
     * Returns all files that have been rejected
     */
    getRejectedFiles(): DropzoneFile[];

    getFilesWithStatus(status: DropzoneFileStatus): DropzoneFile[];

    getQueuedFiles(): DropzoneFile[];

    getUploadedFiles(): DropzoneFile[];

    getAddedFiles(): DropzoneFile[];

    getActiveFiles(): DropzoneFile[];

    init(): unknown;

    destroy(): void;

    updateTotalUploadProgress(): void;

    getFallbackForm(): HTMLElement;

    getExistingFallback(): HTMLElement;

    setupEventListeners(): void;

    removeEventListeners(): void;

    disable(): void;

    enable(): void;

    /**
     * Returns a nicely formatted filesize
     * @param size
     */
    filesize(size: number): string;

    drop(e: DragEvent): void;

    paste(e: Event): void;

    handleFiles(files: File[]): void;

    /**
     * If `done()` is called without argument the file is accepted
     * If you call it with an error message, the file is rejected
     *
     * This function checks the filesize, and if the file.type passes the `acceptedFiles` check.
     * @param file
     * @param done
     */
    accept(file: File, done: (message?: string) => void): void;

    addFile(file: File): void;

    enqueueFiles(files: File[]): void;

    enqueueFile(file: File): void;

    removeFile(file: File): void;

    removeAllFiles(cancelIfNecessary: boolean): void;

    resizeImage(
      file: File,
      width: number,
      height: number,
      resizeMethod: 'crop' | 'contain',
      callback: (file: DropzoneFile | Blob) => void,
    ): void;

    createThumbnail(
      file: File,
      width: number,
      height: number,
      resizeMethod: 'crop' | 'contain',
      fixOrientation: boolean,
      callback?: (thumbnail: string | ArrayBuffer | Event, canvas?: HTMLCanvasElement) => void,
    ): string;

    displayExistingFile(
      mockFile: { name: string; size: number; imageUrl: string },
      imageUrl: string,
      crossOrigin?: boolean,
      resizeThumbnail?: boolean,
    ): void;

    createThumbnailFromUrl(
      file: File,
      width: number,
      height: number,
      resizeMethod: 'crop' | 'contain',
      fixOrientation: boolean,
      callback?: (dataURL: string, canvas: HTMLCanvasElement) => void,
      crossOrigin?: string,
    ): void;

    processQueue(): void;

    processFile(file: File): void;

    cancelUpload(file: File): void;

    resolveOption(option: unknown, ...args: unknown): void;

    uploadFile(file: File): void;

    uploadFiles(files: File): void;

    submitRequest(xhr: XMLHttpRequest, formData: FormData, files: File[]): void;

    static ADDED: 'added' = 'added';
    static QUEUED: 'queued' = 'queued';
    static UPLOADING: 'uploading' = 'uploading';
    static CANCELED: 'canceled' = 'canceled';
    static ERROR: 'error' = 'error';
    static SUCCESS: 'success' = 'success';
  }

  export class DropzoneFile extends File {
    upload: { uuid: string; progress: number; total: number; bytesSet: number; filename: string };

    status: DropzoneFileStatus;
    dataURL: string;
    accepted: boolean;
  }

  type DropzoneFileStatus = 'added' | 'queued' | 'uploading' | 'canceled' | 'error' | 'success';
}
