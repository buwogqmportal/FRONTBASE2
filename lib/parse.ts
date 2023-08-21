import { isObject } from './util';

export type ParserConfig = { info: boolean };

export abstract class Parser<T = unknown> {
  config: ParserConfig;

  constructor(config: Partial<ParserConfig> = {}) {
    this.config = { info: false, ...config };
  }

  abstract toLocal(str: unknown): T;

  toAPI(data: T): unknown {
    return data;
  }
}

export class NeutralParser<T> extends Parser<T> {
  toLocal(str: unknown): T {
    return str as T;
  }
}

export class StringParser extends Parser<string> {
  constructor(public fallback = '') {
    super();
  }

  toLocal(str: unknown): string {
    if (typeof str === 'string') {
      return str.trim() || this.fallback;
    } else if (typeof str === 'object' || typeof str === 'undefined' || str === null) {
      return this.fallback;
    } else {
      return str.toString();
    }
  }
}

export class BooleanParser extends Parser<boolean> {
  toLocal(str: unknown): boolean {
    return Boolean(str) && str !== '0' && str !== 'false';
  }

  toAPI(bool: boolean): string {
    return bool ? '1' : '0';
  }
}

export class NumberParser extends Parser<number> {
  constructor(public fallback = null) {
    super();
  }

  toLocal(str: unknown): number {
    if (typeof str === 'number') return str;
    if (typeof str !== 'string') return this.fallback;
    const parsed = parseFloat(str);
    if (isNaN(parsed)) {
      return this.fallback;
    } else {
      return parsed;
    }
  }

  toAPI(num: number): string {
    if (!num && num !== 0) return null;
    if (typeof num === 'number') return num.toString();
    return num;
  }
}

export class DateParser extends Parser<Date> {
  constructor(public withTime = true) {
    super();
  }

  toLocal(str: unknown): Date {
    if (!str) return null;
    if (str instanceof Date) return str;
    if (typeof str !== 'string') return;

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
  }

  toAPI(date: Date): string {
    return date
      .toISOString()
      .substring(0, this.withTime ? 19 : 10)
      .replace('T', ' ');
  }
}

export class ArrayParser<
  Spec extends Parser,
  T extends Spec extends Parser<infer R> ? R[] : string[],
> extends Parser<T> {
  constructor(public spec: Spec) {
    super();
  }

  toLocal(str: unknown): T {
    if (str && Array.isArray(str)) {
      // @ts-ignore
      return str.map((e) => this.spec.toLocal(e));
    } else if (str) {
      // @ts-ignore
      return [this.spec.toLocal(str)];
    } else {
      // @ts-ignore
      return [];
    }
  }

  toAPI(arr: T): unknown[] {
    return arr.map((e) => this.spec.toAPI(e));
  }
}

export class ObjectParser<
  Spec extends Record<string, Parser>,
  T extends {
    [K in keyof Spec]: Spec[K] extends Parser<infer R> ? R : string;
  },
> extends Parser<T> {
  constructor(public spec: Spec) {
    super();
  }

  toLocal(str: unknown): T {
    if (!isObject(str)) return;

    const res: Record<string, unknown> = { ...str };

    for (const key in this.spec) {
      res[key] = this.spec[key].toLocal(str[key]);
    }

    return res as T;
  }

  toAPI(data: Partial<T>): Record<string, unknown> {
    const res: Record<string, unknown> = { ...data };

    for (const key in this.spec) {
      res[key] = this.spec[key].toAPI(data[key]);
    }

    return res;
  }
}
