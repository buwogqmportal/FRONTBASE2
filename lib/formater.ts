import { get, writable } from 'svelte/store';
import { DateTime, type DateTimeUnit } from 'luxon';

export function dateToAPIDate(date: Date, withTime = true): string {
  if (!(date instanceof Date)) return '';
  if (withTime) {
    return date
      .toISOString()
      .substring(0, withTime ? 19 : 10)
      .replace('T', ' ');
  } else {
    return [date.getFullYear(), date.getMonth() + 1, date.getDate()]
      .map((n) => n.toString().padStart(2, '0'))
      .join('-');
  }
}

export function dateFromAPIDate(str: string | Date): Date {
  if (str instanceof Date) return str;
  if (!str || !(typeof str === 'string')) return null;

  const match = str.match(/^(\d{4})-(\d{2})-(\d{2})(?:.(\d{2}):(\d{2})(?::(\d{2}))?)?$/);

  if (!match) return null;

  const timezone = new Date().getTimezoneOffset();

  if (match[4]) {
    return new Date(
      parseInt(match[1]), //year
      parseInt(match[2]) - 1, //month
      parseInt(match[3]), // date
      parseInt(match[4]) - timezone / 60 || 0, //hour
      parseInt(match[5]) || 0, // minutes
      parseInt(match[6]) || 0, // seconds
    );
  } else {
    return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  }
}

export function parseRelativeDate(date: string): DateTime {
  const match = date.match(
    /(?:(start_of|end_of)_(year|quarter|month|week|day|hour)|now)(?:(?:_plus_(\d+)_|_minus_(\d+)_)(year|quarter|month|week|day|hour))?/,
  );

  if (match) {
    const [_, fn, fn_unit, plus_amount, minus_amount, change_unit] = match;
    let res = DateTime.now();
    if (fn === 'start_of') res = res.startOf(fn_unit as DateTimeUnit);
    else if (fn === 'end_of') res = res.endOf(fn_unit as DateTimeUnit);
    if (plus_amount) res = res.plus({ [change_unit]: plus_amount });
    else if (minus_amount) res = res.minus({ [change_unit]: minus_amount });
    return res;
  } else {
    return DateTime.fromISO(date, { zone: 'utc' });
  }
}

export function dateTimeFromAPIDate(str: string | DateTime): DateTime {
  if (str instanceof DateTime) return str.isValid ? str : null;
  if (!str || !(typeof str === 'string')) return null;

  const date = DateTime.fromISO(str);

  return date.isValid ? date : null;
}

export class RelativeDateRules {
  constructor(public locale: string = '') {
    this.locale = this.locale.substring(0, 2);
  }

  format(date: Date): string {
    const dt = DateTime.fromJSDate(date);
    const now = DateTime.now();

    switch (this.locale) {
      case 'en':
        if (now.startOf('day') <= dt && dt < now.endOf('day')) {
          return 'today';
        } else if (now.minus({ day: 1 }).startOf('day') <= dt && dt < now.minus({ day: 1 }).endOf('day')) {
          return 'yesterday';
        } else if (now.plus({ day: 1 }).startOf('day') <= dt && dt < now.plus({ day: 1 }).endOf('day')) {
          return 'tomorrow';
        } else if (now.startOf('week') <= dt && dt < now.endOf('week')) {
          return 'week';
        } else {
          return 'date';
        }
      default:
      case 'de':
        if (now.startOf('day') <= dt && dt < now.endOf('day')) {
          return 'today';
        } else if (now.minus({ day: 1 }).startOf('day') <= dt && dt < now.minus({ day: 1 }).endOf('day')) {
          return 'yesterday';
        } else if (now.minus({ day: 2 }).startOf('day') <= dt && dt < now.minus({ day: 2 }).endOf('day')) {
          return 'yesterday2';
        } else if (now.plus({ day: 1 }).startOf('day') <= dt && dt < now.plus({ day: 1 }).endOf('day')) {
          return 'tomorrow';
        } else if (now.plus({ day: 2 }).startOf('day') <= dt && dt < now.plus({ day: 2 }).endOf('day')) {
          return 'tomorrow2';
        } else if (now.startOf('week') <= dt && dt < now.endOf('week')) {
          return 'week';
        } else {
          return 'date';
        }
    }
  }
}

export const collator = writable(new Intl.Collator());
export const cardinal = writable(new Intl.PluralRules());
export const dateFormat = writable(new Intl.DateTimeFormat());
export const timeFormat = writable(new Intl.DateTimeFormat());
export const datetimeFormat = writable(new Intl.DateTimeFormat());
export const relativeDateFormat = writable(new RelativeDateRules());
export const weekFormat = writable(new Intl.DateTimeFormat());

export const formatters: Record<string, (formatter: unknown) => string> = {
  date(date: string | Date | null | undefined): string {
    if (typeof date === 'string') {
      date = dateFromAPIDate(date);
    }

    if (date && date instanceof Date) {
      return get(dateFormat).format(date);
    } else {
      return '';
    }
  },
  time(date: string | Date | null | undefined): string {
    if (typeof date === 'string') {
      date = dateFromAPIDate(date);
    }

    if (date && date instanceof Date) {
      return get(timeFormat).format(date);
    } else {
      return '';
    }
  },
  datetime(date: string | Date | null | undefined): string {
    if (typeof date === 'string') {
      date = dateFromAPIDate(date);
    }

    if (date && date instanceof Date) {
      return get(datetimeFormat).format(date);
    } else {
      return '';
    }
  },
};

export const MILLISECOND = 1;
export const SECOND = 1000 * MILLISECOND;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;

export function todayPlusDays(days = 0): Date {
  const nowWTime = new Date();
  const now = new Date(nowWTime.getFullYear(), nowWTime.getMonth(), nowWTime.getDate() + days);

  return now;
}
