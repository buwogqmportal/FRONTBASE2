import { browser } from '$app/env';
import { APIConflictingEntry, APIGenericError } from '$baselib/connection';
import { APINotFoundError } from '$baselib/connection';
import { connectionSend, userHasRight } from '$baselib/stores';
import { deepAssign, isObject } from '$baselib/util';
import { useMutation, useQuery, type QueryClient } from '@sveltestack/svelte-query';
import { get } from 'svelte/store';
import type { APIError } from '.';
import { LanguageRequest } from './language';

export const API_LANGUAGE_ITEM_URL_ID_COMMON = '9';

export type APILanguageItem = {
  language_item_ID: string;
  language_ID: string;
  language_title?: string;
  language_item_root: string;
  language_item_branch: string;
  language_item_leaf: string;
  language_item_data: string;
  language_item_type?: string;
  language_item_company_url_type_ID?: string;
};

const TranslatedLeafSymbol = Symbol('leaf');

export type APILanguageTree = Record<string, APILanguageRoot>;
export type APILanguageRoot = Record<string, APILanguageBranch> | APILanguageLeaf;
export type APILanguageBranch = Record<string, APILanguageLeaf> | APILanguageLeaf;
export type APILanguageLeaf = string;

export type APILanguageTreeTranslated = Record<string, APILanguageRootTranslated>;
export type APILanguageRootTranslated = Record<string, APILanguageBranchTranslated> | APILanguageLeafTranslated;
export type APILanguageBranchTranslated = Record<string, APILanguageLeafTranslated> | APILanguageLeafTranslated;
export type APILanguageLeafTranslated = Record<string, string> & { [x: symbol]: Record<string, string> };

export function isTranslatedLeaf(leaf: unknown): leaf is APILanguageLeafTranslated {
  return isObject(leaf) && TranslatedLeafSymbol in leaf;
}

export function getTranslatedLeafData(leaf: APILanguageLeafTranslated) {
  return leaf[TranslatedLeafSymbol];
}

export function makeAPILanguageLeafTranslated(
  translations: Record<string, string>,
  fromAPI = true,
): APILanguageLeafTranslated {
  const apiTranslations = {};

  if (fromAPI) {
    for (const key in translations) {
      const value = translations[key];

      if (!value) continue;

      apiTranslations[key] = value;
    }
  }

  return {
    ...translations,
    [TranslatedLeafSymbol]: apiTranslations,
  };
}

function mapLanguageTree(lang: string, tree: APILanguageTree): APILanguageTreeTranslated {
  const mapped: APILanguageTreeTranslated = {};

  for (const root in tree) {
    if (Object.prototype.hasOwnProperty.call(tree, root)) {
      const branchMap = tree[root];

      if (typeof branchMap === 'string') {
        mapped[root] = makeAPILanguageLeafTranslated({
          [lang]: branchMap,
        });
      } else {
        mapped[root] = {};
        for (const branch in branchMap) {
          if (Object.prototype.hasOwnProperty.call(branchMap, branch)) {
            const leafMap = branchMap[branch];

            if (typeof leafMap === 'string') {
              mapped[root][branch] = makeAPILanguageLeafTranslated({
                [lang]: leafMap,
              });
            } else {
              mapped[root][branch] = {};
              for (const leaf in leafMap) {
                if (Object.prototype.hasOwnProperty.call(leafMap, leaf)) {
                  const value = leafMap[leaf];
                  mapped[root][branch][leaf] = makeAPILanguageLeafTranslated({
                    [lang]: value,
                  });
                }
              }
            }
          }
        }
      }
    }
  }

  return mapped;
}

function unmapLanguageTree(tree: APILanguageTreeTranslated): Record<string, APILanguageTree> {
  const mapped: Record<string, APILanguageTree> = {};

  for (const root in tree) {
    if (Object.prototype.hasOwnProperty.call(tree, root)) {
      const branchMap = tree[root];

      if (isTranslatedLeaf(branchMap)) {
        for (const lang in branchMap) {
          if (Object.prototype.hasOwnProperty.call(branchMap, lang)) {
            const value = branchMap[lang];
            if (!(lang in mapped)) {
              mapped[lang] = {};
            }
            mapped[lang][root] = value;
          }
        }
      } else {
        for (const branch in branchMap) {
          if (Object.prototype.hasOwnProperty.call(branchMap, branch)) {
            const leafMap = branchMap[branch];

            if (isTranslatedLeaf(leafMap)) {
              for (const lang in leafMap) {
                if (Object.prototype.hasOwnProperty.call(leafMap, lang)) {
                  const value = leafMap[lang];
                  if (!(lang in mapped)) {
                    mapped[lang] = {};
                  }
                  if (!(root in mapped[lang])) {
                    mapped[lang][root] = {};
                  }
                  mapped[lang][root][branch] = value;
                }
              }
            } else {
              for (const leaf in leafMap) {
                if (Object.prototype.hasOwnProperty.call(leafMap, leaf)) {
                  const leafValue = leafMap[leaf];

                  for (const lang in leafValue) {
                    if (Object.prototype.hasOwnProperty.call(leafValue, lang)) {
                      const value = leafValue[lang];
                      if (!(lang in mapped)) {
                        mapped[lang] = {};
                      }
                      if (!(root in mapped[lang])) {
                        mapped[lang][root] = {};
                      }
                      const mroot = mapped[lang][root];
                      if (typeof mroot === 'string') {
                        continue;
                      }
                      if (!(root in mroot)) {
                        mroot[branch] = {};
                      }
                      const mbranch = mroot[branch];
                      if (typeof mbranch === 'string') {
                        continue;
                      }
                      mbranch[leaf] = value;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return mapped;
}

function updateTree(
  path: string[],
  tree: APILanguageRootTranslated | APILanguageBranchTranslated | APILanguageBranchTranslated,
  language_item_company_url_type_ID: string,
  system: boolean,
): Promise<void>[] {
  const responses: Promise<void>[] = [];

  if (isTranslatedLeaf(tree)) {
    for (const language_ID in tree) {
      if (Object.prototype.hasOwnProperty.call(tree, language_ID)) {
        const value = tree[language_ID] as string;
        const update = getTranslatedLeafData(tree);
        if (value && !(language_ID in update)) {
          responses.push(LanguageItemRequest.set(language_ID, path, value, language_item_company_url_type_ID, system));
        } else if (language_ID in update && update[language_ID] !== value) {
          responses.push(
            LanguageItemRequest.update(language_ID, path, value, language_item_company_url_type_ID, system),
          );
        } else if (!value && language_ID in update) {
          responses.push(LanguageItemRequest.delete(language_ID, path, language_item_company_url_type_ID, system));
        }
      }
    }
  } else {
    for (const key in tree) {
      if (Object.prototype.hasOwnProperty.call(tree, key)) {
        const value = tree[key];
        responses.push(...updateTree(path.concat(key), value, language_item_company_url_type_ID, system));
      }
    }
  }

  return responses;
}

export const LanguageItemRequest = {
  async getBranchWithTranslation(
    language_item_root: string,
    language_item_branch: string,
    language_item_company_url_type_ID: string,
  ): Promise<APILanguageBranchTranslated | APILanguageLeafTranslated> {
    const languages = await LanguageRequest.getAll();

    const branchResults = await Promise.all(
      languages.map((lang) =>
        LanguageItemRequest.getBranch(
          lang.language_ID,
          language_item_root,
          language_item_branch,
          language_item_company_url_type_ID,
        ).catch(() => ({})),
      ),
    );

    const branchesTranslated = branchResults.map((tree, i) => mapLanguageTree(languages[i].language_ID, tree));

    return deepAssign({}, ...branchesTranslated)[language_item_root][
      language_item_branch
    ] as APILanguageBranchTranslated;
  },

  async getBranch(
    language_ID: string,
    language_item_root: string,
    language_item_branch: string,
    language_item_company_url_type_ID: string,
  ): Promise<APILanguageTree> {
    const response = await get(connectionSend)<APILanguageTree>('languageitem/getrootbranch', {
      language_ID,
      language_item_root,
      language_item_branch,
      language_item_company_url_type_ID,
    });

    if (response.status === 404) {
      throw new APINotFoundError(response.error?.message);
    }

    return response.success.data;
  },

  async getRoot(
    language_ID: string,
    language_item_root: string,
    language_item_company_url_type_ID: string,
  ): Promise<APILanguageTree> {
    const response = await get(connectionSend)<APILanguageTree>('languageitem/getroot', {
      language_ID,
      language_item_root,
      language_item_company_url_type_ID,
    });

    if (response.status === 404) {
      throw new APINotFoundError(response.error?.message);
    }

    return response.success.data;
  },

  async get(
    language_ID: string,
    [language_item_root, language_item_branch, language_item_leaf]: string[],
    language_item_company_url_type_ID?: string,
  ): Promise<APILanguageTree> {
    const response = await get(connectionSend)<APILanguageTree>('languageitem/get', {
      language_ID,
      language_item_root,
      language_item_branch,
      language_item_leaf,
      language_item_company_url_type_ID,
    });

    if (response.status === 404) {
      throw new APINotFoundError(response?.error?.message);
    }

    return response.success.data;
  },

  async set(
    language_ID: string,
    [language_item_root, language_item_branch, language_item_leaf]: string[],
    language_item_data: string,
    language_item_company_url_type_ID: string,
    system: boolean,
  ): Promise<void> {
    const response = await get(connectionSend)<true>('languageitem/set', {
      language_ID,
      language_item_root,
      language_item_branch,
      language_item_leaf,
      language_item_data,
      language_item_company_url_type_ID,
      system,
    });

    if (response.status === 406) {
      throw new APINotFoundError(response?.error.message);
    }

    if (response.status === 400) {
      throw new APIConflictingEntry(response?.error.message, response.status);
    }
  },

  async update(
    language_ID: string,
    [language_item_root, language_item_branch, language_item_leaf]: string[],
    language_item_data: string,
    language_item_company_url_type_ID: string,
    system: boolean,
  ): Promise<void> {
    const response = await get(connectionSend)<true>('languageitem/update', {
      language_ID,
      language_item_root,
      language_item_branch,
      language_item_leaf,
      language_item_data,
      language_item_company_url_type_ID,
      system,
    });

    if (response.status === 404) {
      throw new APIGenericError(response.error?.message);
    }
  },

  async updateBranch(
    root: string,
    branch: string,
    tree: APILanguageBranchTranslated,
    language_item_company_url_type_ID: string,
    system: boolean,
  ): Promise<void> {
    await Promise.all(updateTree([root, branch], tree, language_item_company_url_type_ID, system));
  },

  async updateRoot(
    root: string,
    tree: APILanguageRootTranslated,
    language_item_company_url_type_ID: string,
    system: boolean,
  ): Promise<void> {
    await Promise.all(updateTree([root], tree, language_item_company_url_type_ID, system));
  },

  async delete(
    language_ID: string,
    [language_item_root, language_item_branch, language_item_leaf]: string[],
    language_item_company_url_type_ID: string,
    system: boolean,
  ): Promise<void> {
    const response = await get(connectionSend)<'1'>('languageitem/delete', {
      language_ID,
      language_item_root,
      language_item_branch,
      language_item_leaf,
      language_item_company_url_type_ID,
      system,
    });

    if (response.status === 404) {
      throw new APINotFoundError(response.error?.message);
    }
  },
};

export const UseLanguageItemQuery = {
  invalidateProcessAction(
    queryClient: QueryClient,
    {
      language_item_root,
      language_item_branch,
      language_item_leaf,
    }: { language_item_root: string; language_item_branch: string; language_item_leaf: string },
  ) {
    // queryClient.invalidateQueries(UseProcessActionQuery.get_key(process_action_ID));
  },

  getBranchWithTranslation(
    language_item_root: string,
    language_item_branch: string,
    language_item_company_url_type_ID: string,
  ) {
    return useQuery<APILanguageTree, APIError>(
      UseLanguageItemQuery.getBranchWithTranslation_options(
        language_item_root,
        language_item_branch,
        language_item_company_url_type_ID,
      ),
    );
  },

  getBranchWithTranslation_options(
    language_item_root: string,
    language_item_branch: string,
    language_item_company_url_type_ID: string,
  ) {
    return {
      queryKey: UseLanguageItemQuery.getBranchWithTranslation_key(
        language_item_root,
        language_item_branch,
        language_item_company_url_type_ID,
      ),
      queryFn: () =>
        LanguageItemRequest.getBranchWithTranslation(
          language_item_root,
          language_item_branch,
          language_item_company_url_type_ID,
        ),
      enabled:
        browser &&
        get(userHasRight)('languageitem', 'getbranch') &&
        Boolean(language_item_root && language_item_branch && language_item_company_url_type_ID),
    };
  },

  getBranchWithTranslation_key(
    language_item_root: string,
    language_item_branch: string,
    language_item_company_url_type_ID: string,
  ) {
    return [
      'languageitem/getbranchwithtranslations',
      { language_item_root, language_item_branch, language_item_company_url_type_ID },
    ];
  },

  getBranch(
    language_ID: string,
    language_item_root: string,
    language_item_branch: string,
    language_item_company_url_type_ID: string,
  ) {
    return useQuery<APILanguageTree, APIError>(
      UseLanguageItemQuery.getBranch_options(
        language_ID,
        language_item_root,
        language_item_branch,
        language_item_company_url_type_ID,
      ),
    );
  },

  getBranch_options(
    language_ID: string,
    language_item_root: string,
    language_item_branch: string,
    language_item_company_url_type_ID: string,
  ) {
    return {
      queryKey: UseLanguageItemQuery.getBranch_key(
        language_ID,
        language_item_root,
        language_item_branch,
        language_item_company_url_type_ID,
      ),
      queryFn: () =>
        LanguageItemRequest.getBranch(
          language_ID,
          language_item_root,
          language_item_branch,
          language_item_company_url_type_ID,
        ),
      enabled:
        browser &&
        get(userHasRight)('languageitem', 'getbranch') &&
        Boolean(language_ID && language_item_root && language_item_branch && language_item_company_url_type_ID),
    };
  },

  getBranch_key(
    language_ID: string,
    language_item_root: string,
    language_item_branch: string,
    language_item_company_url_type_ID: string,
  ) {
    return [
      'languageitem/getbranch',
      { language_ID, language_item_root, language_item_branch, language_item_company_url_type_ID },
    ];
  },

  getRoot(language_ID: string, language_item_root: string, language_item_company_url_type_ID: string) {
    return useQuery<APILanguageTree, APIError>(
      UseLanguageItemQuery.getRoot_options(language_ID, language_item_root, language_item_company_url_type_ID),
    );
  },

  getRoot_options(language_ID: string, language_item_root: string, language_item_company_url_type_ID: string) {
    return {
      queryKey: UseLanguageItemQuery.getRoot_key(language_ID, language_item_root, language_item_company_url_type_ID),
      queryFn: () => LanguageItemRequest.getRoot(language_ID, language_item_root, language_item_company_url_type_ID),
      enabled:
        browser &&
        get(userHasRight)('languageitem', 'getroot') &&
        Boolean(language_ID && language_item_root && language_item_company_url_type_ID),
    };
  },

  getRoot_key(language_ID: string, language_item_root: string, language_item_company_url_type_ID: string) {
    return ['languageitem/getroot', { language_ID, language_item_root, language_item_company_url_type_ID }];
  },

  get(language_ID: string, language_item_path: string[], language_item_company_url_type_ID?: string) {
    return useQuery<APILanguageTree, APIError>(
      UseLanguageItemQuery.get_options(language_ID, language_item_path, language_item_company_url_type_ID),
    );
  },

  get_options(language_ID: string, language_item_path: string[], language_item_company_url_type_ID?: string) {
    return {
      queryKey: UseLanguageItemQuery.get_key(language_ID, language_item_path, language_item_company_url_type_ID),
      queryFn: () => LanguageItemRequest.get(language_ID, language_item_path, language_item_company_url_type_ID),
      enabled:
        browser &&
        get(userHasRight)('languageitem', 'get') &&
        Boolean(
          language_ID &&
            language_item_path.length === 3 &&
            language_item_path.every(Boolean) &&
            language_item_company_url_type_ID,
        ),
    };
  },

  get_key(
    language_ID: string,
    [language_item_root, language_item_branch, language_item_leaf]: string[],
    language_item_company_url_type_ID?: string,
  ) {
    return [
      'languageitem/get',
      { language_ID, language_item_root, language_item_branch, language_item_leaf, language_item_company_url_type_ID },
    ];
  },
};
