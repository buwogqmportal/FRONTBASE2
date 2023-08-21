import type { Load } from '@sveltejs/kit';
import { isSessionIdValid } from './session';
import { deepAssign } from './util';

/**
 * Page load utility to redirect to a page, if session is not set.
 * If `redirectTo` is `"/login"`, the redirect will happen if the session is set.
 * @param redirectTo
 * @returns
 */
export const redirect: (redirectTo?: string) => Load = (redirectTo = '/login') =>
  function ({ session }) {
    const isSession = isSessionIdValid(session.cookie);
    if ((redirectTo === '/login' && !isSession) || (redirectTo !== '/login' && isSession)) {
      return { status: 302, redirect: redirectTo };
    }
    return { status: 200 };
  };

/**
 * Page load utitlity to take slugs and pass them as component properties.
 * @param paramMap Keys are the component properties and values are the slugs.
 * @returns
 */
export const param: (paramMap: ObjectArgs) => Load = (paramMap) =>
  function ({ params }) {
    const props = {};

    for (const propName in toArgs(paramMap)) {
      if (Object.prototype.hasOwnProperty.call(paramMap, propName)) {
        const paramName = paramMap[propName];
        props[propName] = params[paramName];
      }
    }

    return { props };
  };

/**
 * Page load utitlity to take query parameters and pass them as component properties.
 * @param paramMap Keys are the component properties and values are the query parameters.
 * @returns
 */
export const query: <T = string>(paramMap: ObjectArgs, mapper?: (key: string, value: string) => T) => Load = (
  paramMap,
  mapper,
) =>
  function ({ url }) {
    const props = {};

    for (const propName in toArgs(paramMap)) {
      if (Object.prototype.hasOwnProperty.call(paramMap, propName)) {
        const paramName = paramMap[propName];
        props[propName] = mapper ? mapper(paramName, url.searchParams.get(paramName)) : url.searchParams.get(paramName);
      }
    }

    return { props };
  };

/**
 * Page load utitlity to take all query parameters and pass them to a single component property.
 * @param param Keys are the component properties and values are the query parameters.
 * @returns
 */
export const queryToProp: <T = string>(param: string, mapper?: (key: string, value: string) => T) => Load = (
  param,
  mapper,
) =>
  function ({ url }) {
    const props = {};

    url.searchParams.forEach((value, key) => {
      props[key] = mapper ? mapper(key, value) : value;
    });

    return { props: { [param]: props } };
  };

/**
 * Calls the load functions in parallel and combines and returns their outputs.
 */
export const combine: (...ls: Load[]) => Load = (...loadFunctions) =>
  async function (args) {
    const outputs = await Promise.all(loadFunctions.map((fn) => fn(args)));

    return deepAssign({}, ...outputs);
  };

export const group: (name: string, ...ls: Load[]) => Load = (name, ...loadFunctions) =>
  async function (args) {
    const output = await combine(...loadFunctions)(args);
    return { [name]: output };
  };

export function arrayToQueryParams(obj: { [key: string]: string[] }): string {
  return Object.keys(obj)
    .map((key) => key + '=' + obj[key].map((element) => encodeURI(element.replace(/,/g, '\\,'))).join(','))
    .join('&');
}

export function queryParamsToArray(params: string): string[] {
  return params.split(',').reduce((arr, element) => {
    const lastElement = arr[arr.length - 1];
    if (lastElement?.[lastElement.length - 1] === '\\') {
      arr[arr.length - 1] += element;
    } else {
      arr.push(element);
    }

    return arr;
  }, []);
}

type ObjectArgs = string | string[] | Record<string, string>;

function toArgs(args: ObjectArgs): Record<string, string> {
  if (!args) {
    return {};
  }

  if (typeof args === 'string') {
    return { [args]: args };
  }

  if (Array.isArray(args)) {
    return Object.fromEntries(args.filter(Boolean).map((arg) => [arg, arg]));
  }

  return args;
}
