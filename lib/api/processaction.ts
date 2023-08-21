import { APINotFoundError } from '$baselib/connection';
import type { APIError } from '.';
import { toArray } from '$baselib/util';
import { get } from 'svelte/store';
import { connectionSend, userHasRight } from '$baselib/stores';
import { fromJSONGenerator, JSONConverter, toJSONGenerator } from '$baselib/json';
import { QueryClient, useQuery, type QueryKey, type UseQueryOptions } from '@sveltestack/svelte-query';
import { browser } from '$app/env';

export type APIProcessAction = {
  process_ID: string;
  process_action_ID: string;
  process_action_step: APIProcessActionStep[];
  process_action_title: string;
  process_action_hash?: string;
  process_action_hash_details?: {
    // Ein Prozessschritt läuft gerade und ist generell nicht für Nutzer sichtbar (normalerweise API im Hintergrund)
    process_item_background: boolean;
    // Ein Prozessschritt läuft gerade und ist für den momentanen Nutzer sichtbar
    process_item_foreground: boolean;
    // Ein Prozessschritt läuft gerade und ist für den momentanen Nutzer nicht sichtbar, aber für einen anderen sichtbar
    process_item_hidden: boolean;
  };
};

export type APIProcessActionStep<T = unknown> = {
  process_action_step_ID: string;
  process_action_step_data: T;
  process_action_ID: string;
  process_item_ID: string;
  process_action_step_start: string;
  process_action_step_end: string;
  template_key: string;
  processitemdatadynamic: Record<string, string>[] | Record<string, string>;
  processitemdata: APIProcessItemData;
};

export type APIProcessItemData = Record<string, string>;

export const ProcessActionRequest = {
  ...JSONConverter<APIProcessAction>({
    process_ID: { type: 'string' },
    process_action_ID: { type: 'string' },
    process_action_hash: { info: true },
    process_action_hash_details: {
      info: true,
      fromJSON: fromJSONGenerator({
        process_item_background: { type: 'boolean' },
        process_item_foreground: { type: 'boolean' },
        process_item_hidden: { type: 'boolean' },
      }),
    },
    process_action_step: { type: 'array' },
    process_action_title: { type: 'string' },
  }),

  async set(
    process_ID: string,
    process_action_title: string,
    class_ = '',
    class_ID = '',
    additional_data: unknown,
  ): Promise<APIProcessAction> {
    const response = await get(connectionSend)<string>('processaction/set', {
      process_ID,
      process_action_title,
      class: class_,
      class_ID,
      additional_data: JSON.stringify(additional_data),
    });

    return {
      process_ID,
      process_action_ID: response.success.data,
      process_action_title,
      process_action_step: [],
    };
  },

  async get(process_action_ID: string): Promise<APIProcessAction> {
    const response = await get(connectionSend)<APIProcessAction>('processaction/get', { process_action_ID });

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return ProcessActionRequest.fromJSON(response.success.data);
  },

  async getByClass(class_: string, class_ID: string): Promise<APIProcessAction[]> {
    const response = await get(connectionSend)<APIProcessAction[]>('processaction/getbyclass', {
      class: class_,
      class_ID,
    });

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return toArray(response.success.data).map((json) => ProcessActionRequest.fromJSON(json));
  },

  async getByClassMultiple(class_: string, class_ID: string): Promise<APIProcessAction[]> {
    const response = await get(connectionSend)<APIProcessAction[]>('processaction/getbyclassmultiple', {
      class: class_,
      class_ID,
    });

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return toArray(response.success.data).map((json) => ProcessActionRequest.fromJSON(json));
  },

  async next(
    process_action_ID: string,
    process_action_step_ID: string,
    process_item_ID: string,
    output: string,
    additional_data: unknown = {},
  ): Promise<void> {
    const response = await get(connectionSend)<APIProcessAction>('processaction/next', {
      process_action_ID,
      process_action_step_ID,
      process_item_ID,
      output,
      additional_data: JSON.stringify(additional_data),
    });

    if (response.status === 404) {
      throw new APINotFoundError();
    }
  },
};

export const UseProcessActionQuery = {
  invalidateProcessAction(
    queryClient: QueryClient,
    { process_action_ID, class_, class_ID }: { process_action_ID?: string; class_?: string; class_ID?: string },
  ) {
    if (process_action_ID) queryClient.invalidateQueries(UseProcessActionQuery.get_key(process_action_ID));
    if (class_ && class_ID) queryClient.invalidateQueries(UseProcessActionQuery.getByClass_key(class_, class_ID));
    if (class_ && class_ID)
      queryClient.invalidateQueries(UseProcessActionQuery.getByClassMultiple_key(class_, class_ID));
  },

  get(process_action_ID: string) {
    return useQuery<APIProcessAction, APIError>(UseProcessActionQuery.get_options(process_action_ID));
  },

  get_options(process_action_ID: string) {
    return {
      queryKey: UseProcessActionQuery.get_key(process_action_ID),
      queryFn: () => ProcessActionRequest.get(process_action_ID),
      enabled: browser && get(userHasRight)('processaction', 'get') && Boolean(process_action_ID),
    };
  },

  get_key(process_action_ID: string) {
    return ['processaction/get', process_action_ID];
  },

  getByClass(class_: string, class_ID: string) {
    return useQuery<APIProcessAction[], APIError>(UseProcessActionQuery.getByClass_options(class_, class_ID));
  },

  getByClass_options(class_: string, class_ID: string) {
    return {
      queryKey: UseProcessActionQuery.getByClass_key(class_, class_ID),
      queryFn: () => ProcessActionRequest.getByClass(class_, class_ID),
      enabled: browser && get(userHasRight)('processaction', 'getbyclass') && Boolean(class_) && Boolean(class_ID),
    };
  },

  getByClass_key(class_: string, class_ID: string) {
    return ['processaction/getbyclass', class_, class_ID];
  },

  getByClassMultiple(class_: string, class_ID: string) {
    return useQuery<APIProcessAction[], APIError>(UseProcessActionQuery.getByClassMultiple_options(class_, class_ID));
  },

  getByClassMultiple_options(class_: string, class_ID: string) {
    return {
      queryKey: UseProcessActionQuery.getByClassMultiple_key(class_, class_ID),
      queryFn: () => ProcessActionRequest.getByClassMultiple(class_, class_ID),
      enabled:
        browser && get(userHasRight)('processaction', 'getbyclassmultiple') && Boolean(class_) && Boolean(class_ID),
    };
  },

  getByClassMultiple_key(class_: string, class_ID: string) {
    return ['processaction/getbyclassmultiple', class_, class_ID];
  },
};
