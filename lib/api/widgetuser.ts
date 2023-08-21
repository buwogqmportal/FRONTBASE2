// node modules
import { QueryClient, useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@sveltestack/svelte-query';

// svelte
import { browser } from '$app/env';
import { derived, get, type Readable } from 'svelte/store';

// lib
import { APINotFoundError } from '$baselib/connection';
import { ArrayParser, BooleanParser, NumberParser, ObjectParser, Parser, StringParser } from '$baselib/parse';
import { connectionSend, userHasRight } from '$baselib/stores';
import type { APIError } from '.';

export const widgetUserParser = new ObjectParser({
  widget_class_ID: new StringParser(),
  widget_title: new StringParser(),
  widget_user_enabled: new BooleanParser(),
  widget_x: new NumberParser(),
  widget_y: new NumberParser(),
  widget_w: new NumberParser(),
  widget_h: new NumberParser(),
});

export type APIWidgetUser = typeof widgetUserParser extends Parser<infer R> ? R : string;

export const WidgetUserRequest = {
  async getAll(widget_class: string): Promise<APIWidgetUser[]> {
    const response = await get(connectionSend)<APIWidgetUser[]>('widgetuser/getall', { widget_class });

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return new ArrayParser(widgetUserParser).toLocal(response.success.data);
  },

  async updateAll(widget_class: string, widgets: ({ widget_class_ID: string } & APIWidgetUser)[]): Promise<void> {
    await get(connectionSend)('widgetuser/updateall', {
      widget_class,
      data: JSON.stringify(new ArrayParser(widgetUserParser).toAPI(widgets)),
    });
  },
};

export const UseWidgetUserQuery = {
  getAll(store: Readable<{ widget_class: string }>) {
    const result = useQuery<APIWidgetUser[], APIError>({
      queryKey: UseWidgetUserQuery.getAll_key(get(store).widget_class),
      queryFn: () => undefined,
      enabled: false,
    });

    result.subscribe(() => {
      const optionsStore = UseWidgetUserQuery.getAll_optionsStore(store);

      return optionsStore.subscribe((options) => result.setOptions(options));
    });

    return result;
  },

  getAll_options([$options, $userHasRight]: [
    { widget_class: string },
    (class_: string, function_: string) => boolean,
  ]): UseQueryOptions<APIWidgetUser[], APIError> {
    return {
      queryKey: UseWidgetUserQuery.getAll_key($options.widget_class),
      queryFn: () => WidgetUserRequest.getAll($options.widget_class),
      enabled: browser && $userHasRight('widget', 'getall') && Boolean($options.widget_class),
    };
  },

  getAll_optionsStore(store: Readable<{ widget_class: string }>) {
    return derived([store, userHasRight], (stores) => UseWidgetUserQuery.getAll_options(stores));
  },

  getAll_key(widget_class: string) {
    return ['widget/getall', widget_class];
  },

  async getAll_update(
    queryClient: QueryClient,
    widget_class: string,
    widgets: ({ widget_class_ID: string } & Partial<APIWidgetUser>)[],
  ): Promise<APIWidgetUser[]> {
    const key = UseWidgetUserQuery.getAll_key(widget_class);

    await queryClient.cancelQueries(key);

    const previousWidgets = queryClient.getQueryData<APIWidgetUser[]>(key);

    queryClient.setQueryData(key, () => widgets);

    return previousWidgets;
  },

  getAll_invalidate(queryClient: QueryClient, widget_class: string) {
    const key = UseWidgetUserQuery.getAll_key(widget_class);

    queryClient.invalidateQueries(key);
  },
};

export const UseWidgetUserMutation = {
  updateAll(fallback: { widget_class?: string } = {}) {
    const queryClient = useQueryClient();

    return useMutation(
      ({
        widget_class,
        widgets,
      }: {
        widget_class?: string;
        widgets: ({ widget_class_ID: string } & Partial<APIWidgetUser>)[];
      }) => WidgetUserRequest.updateAll(widget_class || fallback.widget_class, widgets),
      {
        onMutate: async ({ widget_class, widgets }) => {
          const previousWidgets = await UseWidgetUserQuery.getAll_update(
            queryClient,
            widget_class || fallback.widget_class,
            widgets,
          );

          return { previousWidgets };
        },

        onError: (_err, { widget_class }, context: { previousWidgets: APIWidgetUser[] }) => {
          const key = UseWidgetUserQuery.getAll_key(widget_class || fallback.widget_class);
          queryClient.setQueryData(key, context.previousWidgets);
        },

        onSettled: (_, __, { widget_class }) => {
          const key = UseWidgetUserQuery.getAll_key(widget_class || fallback.widget_class);
          queryClient.invalidateQueries(key);
        },
      },
    );
  },
};
