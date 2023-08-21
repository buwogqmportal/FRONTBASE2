import { browser } from '$app/env';
import { APINotFoundError } from '$baselib/connection';
import { connectionSend, userHasRight } from '$baselib/stores';
import { useQuery } from '@sveltestack/svelte-query';
import { get } from 'svelte/store';
import type { APIError } from '.';

export type APILanguage = {
  language_ID: string;
  language_title: string;
};

let languages: APILanguage[];

export const LanguageRequest = {
  async set(language_ID: string, language_title: string, url_ID: string): Promise<string> {
    const response = await get(connectionSend)<string>('language/set', {
      language_ID,
      language_title,
      url_ID,
    });

    if (response.status === 404) {
      throw new APINotFoundError(response.error.message);
    }

    return response.success.data;
  },

  async getAll(invalidateCache = false): Promise<APILanguage[]> {
    if (!languages || invalidateCache) {
      const response = await get(connectionSend)<APILanguage[]>('language/getall');

      languages = response.success.data;
    }

    return languages;
  },
};

export const UseLanguageQuery = {
  getAll() {
    return useQuery<APILanguage[], APIError>(UseLanguageQuery.getAll_options());
  },

  getAll_options() {
    return {
      queryKey: UseLanguageQuery.getAll_key(),
      queryFn: () => LanguageRequest.getAll(),
      enabled: browser && get(userHasRight)('language', 'getall'),
    };
  },

  getAll_key() {
    return ['language/getall'];
  },
};
