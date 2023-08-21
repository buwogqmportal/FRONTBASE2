<script lang="ts" context="module">
  export type FormErrorMessage = (name: string) => string;
  export type FormChangedFiles = Record<string, (id: string) => Promise<void>>;
</script>

<script lang="ts">
  // node modules
  import { _ } from 'svelte-i18n';

  // svelte
  import { goto } from '$app/navigation';
  import { createEventDispatcher, setContext } from 'svelte';
  import { writable } from 'svelte/store';

  // lib
  import type { APIErrorMsg } from '$baselib/api';
  import { APIValidationError } from '$baselib/connection';
  import { connectionSend } from '$baselib/stores';
  import { errorMessageGenerator, evalMaybeFunction, type MaybeFunction, type MaybePromise } from '$baselib/util';

  // components
  import TranslationProvider from './Form/TranslationProvider.svelte';

  const dispatch = createEventDispatcher();

  export let update = false;
  export let action: string | ((data: FormData) => MaybePromise<string | void>);
  export let successURL: MaybeFunction<string, [string]> = null;
  export let id = '';
  export let options: Record<string, unknown> = {};
  export let errors: Record<string, APIErrorMsg> = {};
  export let disabled = false;
  export let validate: () => Record<string, string> | void = () => {};
  export let form: HTMLFormElement = null;
  export let translation: TranslationProvider = null;
  export let root = '';

  export let isSubmitting = false;
  export let hasErrors = false;

  let apierrors: Record<string, APIErrorMsg> = {};

  const errorMessage = writable<FormErrorMessage>(null);

  $: $errorMessage = errorMessageGenerator($_, apierrors, errors);

  setContext('formerrormessage', errorMessage);

  const changedFiles = writable<FormChangedFiles>({});

  setContext('formchangedfiles', changedFiles);

  function handleChange(ev: Event) {
    const name = ev.target['name'];
    if (name && name in apierrors) {
      delete apierrors[name];
      apierrors = apierrors;
    }
    if (name && name in errors) {
      delete errors[name];
      errors = errors;
    }
    hasErrors = Object.keys(apierrors).length + Object.keys(errors).length > 0;
  }

  function mergeIntoErrors(err: Record<string, string> = {}) {
    let changed = false;

    for (const name in err) {
      if (Object.prototype.hasOwnProperty.call(err, name)) {
        const element = err[name];
        if (element) {
          changed = true;
          errors[name] = {
            rule: element,
          };
        } else {
          delete errors[name];
          errors = errors;
          hasErrors = Object.keys(apierrors).length + Object.keys(errors).length > 0;
        }
      }
    }

    errors = errors;

    return changed;
  }

  async function handleSubmit(): Promise<void> {
    const data = new FormData(form);

    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(options, key)) {
        const value = options[key];
        if (value === undefined || value === null) {
          data.delete(key);
        } else {
          data.append(key, value.toString());
        }
      }
    }

    if (!dispatch('submit', data, { cancelable: true })) {
      return;
    }

    if (mergeIntoErrors(validate() || {})) {
      hasErrors = true;
      dispatch('validationError', apierrors);
    }

    if (disabled || hasErrors) {
      isSubmitting = false;
      scrollToFirstError();
      return;
    }

    apierrors = {};
    errors = {};
    isSubmitting = true;
    hasErrors = false;

    try {
      let promise: Promise<string>;

      if (typeof action === 'string') {
        promise = $connectionSend<string>(action, data).then((response) => response.success?.data);
      } else {
        promise = Promise.resolve(action(data)).then((res) => res || '');
      }

      const [rd] = await Promise.all([promise, translation.submit()]);

      await Promise.all(Object.values($changedFiles).map((fn) => fn(id || rd)));

      $changedFiles = {};

      dispatch('success', { id, data });

      if (successURL) {
        requestAnimationFrame(() => {
          let url = location.href;
          goto(evalMaybeFunction(successURL, id || rd), { replaceState: update });

          const interval = setInterval(() => {
            if (url !== location.href) {
              clearInterval(interval);
            }

            goto(evalMaybeFunction(successURL, id || rd), { replaceState: update });
          }, 500);
        });
      }
    } catch (err) {
      if (err instanceof APIValidationError) {
        apierrors = err.errors;
        hasErrors = Object.keys(apierrors).length + Object.keys(errors).length > 0;
        dispatch('validationError', apierrors);
      }
      dispatch('error', err);

      scrollToFirstError();
    } finally {
      isSubmitting = false;
      dispatch('settled');
    }
  }

  function scrollToFirstError() {
    requestAnimationFrame(() => {
      form.querySelector('[data-error]')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  }
</script>

<TranslationProvider {root} branch={id} bind:this={translation} let:isLoading>
  <form class="mt-6 space-y-6" on:submit|preventDefault|self={handleSubmit} bind:this={form} on:change={handleChange}>
    <slot {isLoading} {isSubmitting} {hasErrors} {errors} {disabled} />
  </form>
</TranslationProvider>
