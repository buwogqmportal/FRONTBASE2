import type { _ } from 'svelte-i18n';
import { get, type Readable } from 'svelte/store';
import type { APIErrorMsg } from './api';
import { collator } from './formater';

export type MaybePromise<T> = T | Promise<T>;

export function deepAssign<A, B>(target: A, source1: B): A & B;
export function deepAssign<A, B, C>(target: A, source1: B, source2: C): A & B & C;
export function deepAssign<A>(target: A, ...sources: A[]): A;
export function deepAssign<A, B>(target: unknown, sources: unknown[]): unknown;

/**
 * Works like `Object.assign`, but assigns recursively.
 * @param target
 * @param sources
 * @returns
 */
export function deepAssign(target: unknown, ...sources: unknown[]): unknown {
  target ??= {};

  for (const source of sources) {
    if (!isObject(target) || !isObject(source)) {
      continue;
    }

    const descriptors = (<(string | symbol)[]>Object.keys(source))
      .concat(Object.getOwnPropertySymbols(source))
      .reduce((descriptors, key) => {
        const descriptor = Object.getOwnPropertyDescriptor(source, key);
        if (descriptor.enumerable) {
          if (isObject(source[key])) {
            descriptor.value = deepAssign(target[key], source[key]);
            delete descriptor.get;
            delete descriptor.set;
          }

          try {
            Object.defineProperty({}, 'a', descriptor);
          } catch (e) {
            console.error(descriptor);
          }

          descriptors[key] = descriptor;
        }
        return descriptors;
      }, {});

    Object.defineProperties(target, descriptors);
  }

  return target;
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObject(item: unknown): item is Record<string | symbol | number, unknown> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
export function isObjectOrArray(item: unknown): item is Record<string | symbol | number, unknown> | unknown[] {
  return item && typeof item === 'object';
}

/**
 * Utility function to make an helper function that shows input error messages.
 * The returned function accepts the name of the validated key and should be used in the `errormsg` property of an `<Input/>`.
 *
 * ```svelte
 * <script>
 * // ...
 * let errors: Record<string, string> = {};
 * $: errorMessage = errorMessageGenerator($_, errors);
 * // ...
 * </script>
 * <!-- ... -->
 * <Input ... errormsg={errorMessage('title')} bind:value={title} />
 * <!-- ... -->
 * ```
 * @param format The language object. (usually $_)
 * @param errors An error object from an `APIValidationError`.
 * @returns
 */
export function errorMessageGenerator(
  format: typeof _ extends Readable<infer T> ? T : never,
  errors: Record<string, APIErrorMsg>,
  customErrors: Record<string, APIErrorMsg> = {},
  defaultError = 'error.generic',
): (name: string) => string {
  return function (name) {
    const custom: APIErrorMsg | undefined = customErrors[name];
    const rule: APIErrorMsg | undefined = errors[name];
    if (custom) {
      return format(custom.rule, { default: format(defaultError), values: { param: custom.param } });
    }
    if (rule) {
      return format(`validation.${rule.rule}`, { default: format(defaultError), values: { param: rule.param } });
    } else {
      return '';
    }
  };
}

/**
 * Takes in any nullish value, a single element, or an array and converts it into an array.
 * @param array
 * @returns
 */
export function toArray<T>(array: undefined | null | false | T | T[]): T[] {
  if (array && Array.isArray(array)) {
    return array;
  } else if (array) {
    return [array] as T[];
  } else {
    return [];
  }
}

/**
 * Takes in any nullish value, a single element, or an array and converts it into an array.
 * @param bool
 * @returns
 */
export function toBoolean(bool: undefined | null | boolean | string): boolean {
  return Boolean(bool) && bool !== '0';
}

/**
 * Takes in any nullish value, a single element, or an array and converts it into an array.
 * @param bool
 * @returns
 */
export function toAPIBoolean(bool: undefined | null | boolean | string): '0' | '1' {
  bool = toBoolean(bool);
  return bool ? '0' : '1';
}

export function maybeNumberToString(num: number | string): string {
  if (num === undefined || num === null || (typeof num === 'number' && isNaN(num))) return undefined;
  if (typeof num === 'number') return num.toString();
  else return num;
}

export const convertTo = {
  api: {
    boolean(bool: unknown): '0' | '1' {
      return bool ? '1' : '0';
    },
    number(num: number | string) {
      if (!num && num !== 0) return undefined;
      if (typeof num === 'number') return num.toString();
      else return num;
    },
    date(date: Date, withTime = true): string {
      if (!(date instanceof Date)) return '';
      return date
        .toISOString()
        .substring(0, withTime ? 19 : 10)
        .replace('T', ' ');
    },
  },
  local: {
    string(str: string) {
      return str || '';
    },
    boolean(bool: boolean | string): boolean {
      return Boolean(bool) && bool !== '0' && bool !== 'false';
    },
    number(num: number | string): number {
      if (typeof num === 'number') return num;
      num = parseFloat(num);
      if (isNaN(num)) {
        return null;
      } else {
        return num;
      }
    },
    array<T>(array: false | T | T[]): T[] {
      if (array && Array.isArray(array)) {
        return array;
      } else if (array) {
        return [array] as T[];
      } else {
        return [];
      }
    },
    date(str: string | Date): Date {
      if (!str) return null;
      if (str instanceof Date) return str;

      const match = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:.(\d{2}):(\d{2})(?::(\d{2}))?)?$/);

      if (!match) return null;

      const timezone = new Date().getTimezoneOffset();

      if (match[4]) {
        return new Date(
          parseInt(match[1]),
          parseInt(match[2]) - 1,
          parseInt(match[3]),
          (parseInt(match[4]) || 0) - timezone / 60,
          parseInt(match[5]) || 0,
          parseInt(match[6]) || 0,
        );
      } else {
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      }
    },
  },
};

export function parseToLocal(spec: Record<string, string>, obj: Record<string, unknown>) {
  const res = { ...obj };

  for (const key in spec) {
    res[key] = convertTo.local[spec[key]](obj[key]);
  }

  return res;
}

export function getProperty(obj: unknown, key: string | number): any {
  if (typeof key === 'number' || typeof key !== 'string') return obj[key];

  const keys = key.split('.');

  for (const k of keys) {
    if (!isObjectOrArray(obj)) return;
    obj = obj[k];
  }

  return obj;
}

/**
 * Converts an array into a map usind key.
 * If an id is not unique, then all elements with that id will be in an array in the resulting map.
 * @param objects An array of objects to index.
 * @param name Either the key where the id is stored, or a function that returns an id given the element.
 * @returns
 */
export function index<T>(
  objects: undefined | null | false | T | T[],
  name: string | ((obj: T) => string),
): Record<string, T | T[]> {
  const indexed: { [id: string]: T | T[] | { __index: T[] } } = {};

  objects = toArray(objects);
  const getIndex = typeof name === 'function' ? name : (obj: T) => getProperty(obj, name) as string;

  for (const obj of objects) {
    const i = getIndex(obj);
    const element = indexed[i];

    if (element && '__index' in element) {
      element.__index.push(obj);
    } else if (element) {
      indexed[i] = { __index: [element as T, obj] };
    } else {
      indexed[i] = obj;
    }
  }

  for (const i in indexed) {
    if (Object.prototype.hasOwnProperty.call(indexed, i)) {
      const element = indexed[i];
      if ('__index' in element) {
        indexed[i] = element.__index;
      } else {
        indexed[i] = element;
      }
    }
  }

  return indexed as Record<string, T | T[]>;
}

/**
 * Converts an array into a map usind key.
 * If an id is not unique, then all elements with that id will be in an array in the resulting map.
 * @param objects An array of objects to index.
 * @param name Either the key where the id is stored, or a function that returns an id given the element.
 * @returns
 */
export function indexSingle<T>(
  objects: undefined | null | false | T | T[],
  name: string | ((obj: T) => string),
): Record<string, T> {
  const res = index(objects, name);

  for (const key in res) {
    if (Object.prototype.hasOwnProperty.call(res, key)) {
      const value = res[key];
      if (Array.isArray(value)) {
        res[key] = value[0];
      }
    }
  }

  return res as Record<string, T>;
}

/**
 * Converts an array into a map usind key.
 * Similar to `index`, but the returned objects values will always be arrays, even if an elements id is unique.
 * @param objects An array of objects to index.
 * @param name Either the key where the id is stored, or a function that returns an id given the element.
 * @returns
 */
export function indexMulti<T>(
  objects: undefined | null | false | T | T[],
  name: string | ((obj: T) => string),
): Record<string, T[]> {
  const indexed = {};

  objects = toArray(objects);
  const getIndex: (obj: T) => string = typeof name === 'function' ? name : (obj) => getProperty(obj, name) as string;

  for (const obj of objects) {
    const i = getIndex(obj);

    if (i in indexed && Array.isArray(indexed[i])) {
      indexed[i].push(obj);
    } else {
      indexed[i] = [obj];
    }
  }

  return indexed;
}

export function idGenerator(prefix = ''): () => string {
  let id = 0;
  return function () {
    return prefix + id++;
  };
}

export function focus(node: HTMLElement, parameters = true) {
  if (parameters) node.focus();
}

export function parseType(text: string): { type: string; data: Record<string, string> } {
  const dataIndex = text.indexOf('#');

  if (dataIndex === -1) {
    return { type: text, data: {} };
  }

  const type = text.slice(0, dataIndex);
  const data = text
    .slice(dataIndex + 1)
    .split('|')
    .map((e) => {
      const i = e.indexOf('=');
      if (i === -1) return [e, true];
      else return [e.slice(0, i), e.slice(i + 1)];
    });

  return { type, data: Object.fromEntries(data) };
}

export function styleBackgroundColor(color: string): string {
  const colors = color.match(/^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/);

  if (!colors) return '';

  const r = parseInt(colors[1], 16);
  const g = parseInt(colors[2], 16);
  const b = parseInt(colors[3], 16);

  // https://en.wikipedia.org/wiki/Luma_(video)
  const brightness = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  if (brightness > 127) return `background-color: ${color}; color: black`;
  else return `background-color: ${color}; color: white`;
}

export function prefixObject(prefix: string, obj: Record<string, unknown>): Record<string, unknown> {
  const res = {};

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      res[key ? prefix + '_' + key : prefix] = obj[key];
    }
  }

  return res;
}

export function range(end: number): number[];
export function range(start: number, end: number): number[];
export function range(start: number, end: number): number[];
export function range(start: number, end?: number, step?: number): number[] {
  if (end === undefined || end === null) {
    end = start;
    start = 0;
  }

  step ??= 1;

  const res = [];

  for (let i = start; i < end; i += step) {
    res.push(i);
  }

  return res;
}

export function byStringAsc<T = unknown>(...keys: string[]): (a: T, b: T) => number {
  const $collator = get(collator);
  return (a: T, b: T) => {
    let res: number;
    for (const key of keys) {
      res = $collator.compare(getProperty(a, key)?.toString(), getProperty(b, key)?.toString());
      if (res !== 0) return res;
    }
    return res;
  };
}

export function byStringDesc<T = unknown>(...keys: string[]): (a: T, b: T) => number {
  const $collator = get(collator);
  return (a: T, b: T) => {
    let res: number;
    for (const key of keys) {
      res = $collator.compare(getProperty(b, key)?.toString(), getProperty(a, key)?.toString());
      if (res !== 0) return res;
    }
    return res;
  };
}

export function listToClass(acc: string, value: string): string {
  if (acc && value) {
    return `${acc} ${value}`;
  } else if (acc) {
    return acc;
  } else if (value) {
    return value;
  } else {
    return '';
  }
}

export type MaybeFunction<T, Args extends any[]> = T | ((...args: Args) => T);

export function evalMaybeFunction<T, Args extends any[]>(data: MaybeFunction<T, Args>, ...args: Args): T {
  if (typeof data === 'function') {
    // @ts-ignore
    return data(...args);
  } else {
    return data;
  }
}

export function setPartitition<T>(a: Set<T>, b: Set<T>) {
  const res = {
    union: new Set<T>(),
    intersection: new Set<T>(),
    aWithoutB: new Set<T>(),
    bWithoutA: new Set<T>(),
  };

  for (const e of a) {
    res.union.add(e);
    if (b.has(e)) {
      res.intersection.add(e);
    } else {
      res.aWithoutB.add(e);
    }
  }

  for (const e of b) {
    res.union.add(e);
    if (!a.has(e)) {
      res.bWithoutA.add(e);
    }
  }

  return res;
}

export function htmlDecode(input: string): string {
  const doc = new DOMParser().parseFromString(input, 'text/html');
  return doc.documentElement.textContent;
}
