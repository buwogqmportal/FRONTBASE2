import { convertTo } from './util';

export type JSONDescriptor<T = unknown> =
  | {
      key?: string;
      type: 'array';
      fallback?: T[];
      info?: boolean;
      fromJSON?: (json: Record<string, unknown>[]) => T[];
      toJSON?: (data: T[]) => Record<string, unknown>[];
    }
  | {
      key?: string;
      type?: string;
      fallback?: T;
      info?: boolean;
      fromJSON?: (json: Record<string, unknown>) => T;
      toJSON?: (data: T) => Record<string, unknown>;
    };

export function toJSONGenerator<T extends Record<string, unknown>>(
  desc: Record<string, JSONDescriptor> = {},
): (data: T) => Record<string, unknown> {
  return function (data: T): Record<string, unknown> {
    const json = {};

    for (const key in desc) {
      const descriptor = desc[key];
      if (descriptor.info) continue;

      const value = convertTo.api[descriptor.type] ? convertTo.api[descriptor.type](data[key]) : data[key];
      if (value === undefined || value === null) continue;

      json[descriptor.key ?? key] = descriptor.toJSON ? descriptor.toJSON(value) : value;
    }

    return json;
  };
}

export function fromJSONGenerator<T extends Record<string, unknown>>(
  desc: Record<string, JSONDescriptor> = {},
): (data: Record<string, unknown>) => T {
  return function (json: Record<string, unknown>): T {
    const data = {};

    for (const key in desc) {
      const descriptor = desc[key];

      const value = convertTo.local[descriptor.type] ? convertTo.local[descriptor.type](json[key]) : json[key];
      if (value === undefined || value === null) continue;

      data[descriptor.key ?? key] = (descriptor.fromJSON ? descriptor.fromJSON(value) : value) ?? descriptor.fallback;
    }

    return data as T;
  };
}

export function JSONConverter<T extends Record<string, unknown>>(
  desc: Record<string, JSONDescriptor>,
): {
  fromJSON: (json: Record<string, unknown>) => T;
  toJSON: (data: Partial<T>) => Record<string, unknown>;
} {
  return {
    fromJSON: fromJSONGenerator<T>(desc),
    toJSON: toJSONGenerator<Partial<T>>(desc),
  };
}

export function JSONArrayConverter<T extends Record<string, unknown>>(
  desc: Record<string, JSONDescriptor>,
): {
  fromJSON: (json: Record<string, unknown>[]) => T[];
  toJSON: (data: Partial<T>[]) => Record<string, unknown>[];
} {
  const fromJSON = fromJSONGenerator<T>(desc);
  const toJSON = toJSONGenerator<Partial<T>>(desc);
  return {
    fromJSON: (data: Record<string, unknown>[]) => data.map(fromJSON),
    toJSON: (data: Record<string, unknown>[]) => data.map(toJSON),
  };
}
