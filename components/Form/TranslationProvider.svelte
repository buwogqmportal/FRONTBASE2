<script lang="ts" context="module">
  export type TranslationProviderContext = Writable<{
    data: APILanguageBranchTranslated;
    languages: APILanguage[];
    loading: boolean;
    techValue: (key: string) => string;
  }>;
</script>

<script lang="ts">
  import { browser } from '$app/env';

  import { type APILanguage, LanguageRequest } from '$baselib/api/language';
  import {
    type APILanguageBranchTranslated,
    LanguageItemRequest,
    API_LANGUAGE_ITEM_URL_ID_COMMON,
  } from '$baselib/api/languageitem';

  import { setContext } from 'svelte';
  import { type Writable, writable } from 'svelte/store';

  export let root: string;
  export let branch: string;
  export async function submit() {
    if (root && branch) {
      return LanguageItemRequest.updateBranch(root, branch, $ctx.data, API_LANGUAGE_ITEM_URL_ID_COMMON, false);
    }
  }

  const ctx: TranslationProviderContext = writable({
    data: {},
    languages: [],
    loading: true,
    techValue: (key) => `<-${root}.${branch}.${key}->`,
  });

  setContext('translation', ctx);

  let loadingLanguages = true;
  let loadingItems = true;

  if (browser) {
    LanguageRequest.getAll()
      .then((val) => {
        $ctx.languages = val;
      })
      .finally(() => {
        loadingLanguages = false;
        if (!root || !branch || !loadingItems) $ctx.loading = false;
      });

    if (root && branch) {
      LanguageItemRequest.getBranchWithTranslation(root, branch, API_LANGUAGE_ITEM_URL_ID_COMMON)
        .then((val) => {
          $ctx.data = Object.assign($ctx.data, val);
        })
        .catch(() => {})
        .finally(() => {
          loadingItems = false;
          if (!loadingLanguages) $ctx.loading = false;
        });
    }
  }
</script>

<slot isLoading={loadingLanguages || loadingItems} />
