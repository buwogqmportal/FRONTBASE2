import { register, init, getLocaleFromNavigator } from 'svelte-i18n';
import type { APILanguage } from './api/language';
import type { ConnectionSend } from './connection';
import { deepAssign } from './util';

export async function registerRemoteLocales(connectionSend: ConnectionSend) {
  const languages = await connectionSend<APILanguage[]>('language/getall');

  if (languages.success) {
    for (const { language_ID } of languages.success.data) {
      register(language_ID.toLocaleLowerCase(), async () =>
        arrays2Objects(
          deepAssign(
            {},
            ...(await Promise.all([
              connectionSend(`languageitem/getbylanguageid/${language_ID}`)
                .then((val) => val.success?.data ?? {})
                .catch(() => ({})),
              dynLang(language_ID),
            ])),
          ),
        ),
      );
    }
  } else {
    console.error('failed loading languages');
  }

  await init({
    fallbackLocale: 'de',
    initialLocale: getLocaleFromNavigator(),
  });
}

function dynLang(language: string): Promise<any> {
  if (language.toLowerCase() === 'de') {
    return import(`$lib/lang/de.json`).then((val) => val.default);
  } else if (language.toLowerCase() === 'en') {
    return import(`$lib/lang/en.json`).then((val) => val.default);
  } else {
    return Promise.resolve({});
  }
}

export async function registerLocales() {
  register('de', () => import('$lib/lang/de.json'));
  register('en', () => import('$lib/lang/en.json'));

  await init({
    fallbackLocale: 'de',
    initialLocale: getLocaleFromNavigator(),
  });
}

function arrays2Objects(obj: Record<string, unknown>): Record<string, unknown> {
  const res = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const element = obj[key];

      if (Array.isArray(element)) {
        res[key] = objectFromArray(element);
      }

      if (element !== null && typeof element === 'object') {
        res[key] = arrays2Objects(element as Record<string, unknown>);
      } else {
        res[key] = element;
      }
    }
  }

  return res;
}

function objectFromArray<T>(arr: T[]): Record<string, T> {
  return Object.fromEntries(arr.map((value, index) => [index, value]));
}
