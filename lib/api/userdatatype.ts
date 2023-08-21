import { APINotFoundError } from '$baselib/connection';
import type { APIError } from '.';
import { toArray } from '$baselib/util';
import { get } from 'svelte/store';
import { connectionSend, userHasRight } from '$baselib/stores';
import { QueryClient, useQuery, type QueryKey, type UseQueryOptions } from '@sveltestack/svelte-query';
import { browser } from '$app/env';

export type APIUserDataType = {
  user_type: string;
  user_data_type_key: string;
  user_data_type_type: string;
  user_data_type_title: string;
  user_data_type_description: string;
  user_data_type_class: string;
};

export type APIUserDataTypeGroup = {
  user_data_type_group_ID: string;
  user_data_type_group_title: string;
  user_data_type_group_description: string;
};

export type APIProcessItemData = Record<string, string>;

export const UserDataTypeRequest = {
  async get(user_data_type_key: string): Promise<APIUserDataType> {
    const response = await get(connectionSend)<APIUserDataType>('userdatatype/get', { user_data_type_key });

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return response.success.data;
  },

  async getAll(): Promise<APIUserDataType[]> {
    const response = await get(connectionSend)<APIUserDataType[]>('userdatatype/getall');

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return toArray(response.success.data);
  },
};

export const UseUserDataTypeQuery = {
  invalidateProcessAction(queryClient: QueryClient, { user_data_type_key }: { user_data_type_key?: string }) {
    if (user_data_type_key) queryClient.invalidateQueries(UseUserDataTypeQuery.get_key(user_data_type_key));
    queryClient.invalidateQueries(UseUserDataTypeQuery.getAll_key());
  },

  get(user_data_type_key: string) {
    return useQuery<APIUserDataType, APIError>(UseUserDataTypeQuery.get_options(user_data_type_key));
  },

  get_options(user_data_type_key: string) {
    return {
      queryKey: UseUserDataTypeQuery.get_key(user_data_type_key),
      queryFn: () => UseUserDataTypeQuery.get(user_data_type_key),
      enabled: browser && get(userHasRight)('processaction', 'get') && Boolean(user_data_type_key),
    };
  },

  get_key(user_data_type_key: string) {
    return ['userdatatype/get', user_data_type_key];
  },

  getAll() {
    return useQuery<APIUserDataType[], APIError>(UseUserDataTypeQuery.getAll_options());
  },

  getAll_options() {
    return {
      queryKey: UseUserDataTypeQuery.getAll_key(),
      queryFn: () => UserDataTypeRequest.getAll(),
      enabled: browser && get(userHasRight)('userdatatype', 'getall'),
    };
  },

  getAll_key() {
    return ['userdatatype/getall'];
  },
};
