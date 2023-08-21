import { derived, get, readable, writable } from 'svelte/store';
import type { ConnectionSend } from './connection';
import type { SessionBehaviour } from './session';
import type { FilterPageProperties } from './filter';
import { _ } from 'svelte-i18n';
import { topicUnreadParser, type APITopicUnread, type APITopicUnreadItem } from './api/topic';
import { indexSingle } from './util';
import { DateTime } from 'luxon';

export const state = writable<SessionBehaviour>();

export const connectionSend = writable<ConnectionSend>();

export const showMenu = writable(false);

export const userAgent = writable<{
  getBrowser(): { name: string; version: string; major?: string };
  getCPU(): { architecture?: string };
  getDevice(): { model?: string; type?: string; vendor?: string };
  getEngine(): { name: string; version: string };
  getOS(): { name: string; version: string };
}>(undefined);

/**
 * Sets the title of the page.
 *
 * > _**Note:** Do not use directly, use `<Meta/>` instead._
 */
export const _title = writable('');

/**
 * Sets if the page content is supposed to fill the screen.
 *
 * > _**Note:** Do not use directly, use `<Meta/>` instead._
 */
export const _screenFull = writable(false);

/**
 * Sets if the page content is supposed to fill the screen.
 *
 * > _**Note:** Do not use directly, use `<Meta/>` instead._
 */
export const _screenFullMobile = writable(false);

/**
 * Sets if the page content is supposed to fill the screen.
 *
 * > _**Note:** Do not use directly, use `<Meta/>` instead._
 */
export const _screenFullDesktop = writable(false);

export const _slimMenu = writable(false);

/**
 * Sets if the header (title and menu) should be visible.
 *
 * > _**Note:** Do not use directly, use `<Meta/>` instead._
 */
export const _showHeader = writable(true);

/**
 * Sets menu button should be visible.
 *
 * > _**Note:** Do not use directly, use `<Meta/>` instead._
 */
export const _showMenuBtn = writable(true);

/**
 * Sets the location of the back button.
 *
 * > _**Note:** Do not use directly, use `<Meta/>` instead._
 */
export const _backLink = writable('');

/**
 * Sets button on desktop to be visible
 *
 * > _**Note:** Do not use directly, use `<Meta/>` instead._
 */
export const _showBtn = writable('');

/**
 * Sets if the content inside ContentWrapper is aligned on top or centered
 *
 * > _**Note:** Do not use directly, use `<Meta/>` instead._
 */
export const _contentClass = writable('');

/**
 * Sets if the footer should be visible
 *
 * > _**Note:** Do not use directly, use `<Meta/>` instead._
 */
export const _hideFooter = writable(false);

/**
 * Contains Props and Functions for the Modal Component.
 */
export const modal = writable(null);

/**
 * Sets cancelbutton on desktop to be visible
 *
 * > _**Note:** Do not use directly, use `<Meta/>` instead._
 */
export const _showCancelBtn = writable(false);

/**
 * Sets filterProperties when foing on a page on desktop to be visible
 */
export const _filterProperties = writable({} as FilterPageProperties);

export const analytics = writable({
  tracking: false,
});

export const userHasRight = writable<(class_: string, function_?: string) => boolean>(() => false);

export const now = readable(DateTime.now(), (set) => {
  const id = setInterval(() => {
    set(DateTime.now());
  }, 1000);

  return () => {
    clearInterval(id);
  };
});

export enum Page {
  Office,
  Portal,
  Lieferant,
}

export const page = writable<Page>(null);

export const assignments = writable<Record<string, string>>({});

export const __ = derived(_, ($_) => {
  return function (
    options: { locale?: string; format?: string; default?: string; values?: Record<string, string | number> },
    ...strings: string[]
  ): string {
    return strings.reduceRight((acc, str) => $_(str, { ...options, default: acc }), options.default);
  };
});

export const topicUnread = readable<APITopicUnread & { items_index: Record<string, APITopicUnreadItem> }>(
  {
    count_topicitem: 0,
    count_topics: 0,
    items: [],
    items_index: {},
  },
  (set) => {
    // let update = async () => {};

    const update = derived(
      [connectionSend, userHasRight],
      ([$connectionSend, $userHasRight], setUpdate) => {
        if ($userHasRight('topic', 'getAllUnread')) {
          setUpdate(async () => {
            const results = await $connectionSend('topic/getAllUnread');
            if (results.status === 200) {
              const parsed = topicUnreadParser.toLocal(results.success.data);
              set({ ...parsed, items_index: indexSingle(parsed.items, 'topic_ID') });
            }
          });
        } else {
          setUpdate(async () => {});
        }
      },
      async () => {},
    );

    let $update = get(update);

    const unsubscribe = update.subscribe((value) => {
      $update = value;
      value();
    });

    const id = setInterval(() => $update(), 5000);

    return () => {
      clearInterval(id);
      unsubscribe();
    };
  },
);
