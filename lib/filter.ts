import type { APIColuser } from './api/coluser';
import type { APIColfilterRaw } from './api/coluserfilter';
import type { APISearchResultFacet } from './api/search';
import { index } from './util';

export enum AdvancedDateOptions {
  Overdue = 'overdue',
  Monthly = 'monthly',
}

export type FilterValues = Record<string, string[]>;

export type FilterPageProperties = Record<string, FilterValues>;

export function cloneFilterValues(options: FilterValues): FilterValues {
  const res = {};

  for (const key in options) {
    if (Object.prototype.hasOwnProperty.call(options, key)) {
      res[key] = options[key].slice();
    }
  }

  return res;
}

export function filterValuesToAPIColfilterRequest(filterData: FilterValues): APIColfilterRaw[] {
  const coluserfilter: APIColfilterRaw[] = [];
  for (const attr in filterData) {
    filterData[attr][0] === '' ? (filterData[attr] = []) : filterData[attr];
    const obj: APIColfilterRaw = {
      col_class_ID: attr,
      col_user_filter_data: JSON.stringify(filterData[attr]),
    };

    coluserfilter.push(obj);
  }
  return coluserfilter;
}

// Creates a copy of `filterOptions` with only the keys specified. If a key is specified, but doesn't exist in `filterOptions`, the result will have an empty array with that key.
export function selectFilterPageEntries(filterOptions: FilterValues, keys: string[]): FilterValues {
  const result = {};

  for (const key of keys) {
    result[key] = filterOptions[key] ?? [];
  }

  return result;
}

export function mergeFilterArrays(obj1: FilterValues, obj2: FilterValues): FilterValues {
  for (const attr1 in obj1) {
    for (const attr2 in obj2) {
      if (attr1 === attr2) {
        obj1[attr1] = [...new Set(obj1[attr1].concat(obj2[attr2]))];
      }
    }
  }
  return obj1;
}

export function extractValidFilterData(result: APISearchResultFacet[], colData: APIColuser[]) {
  const activeCols = colData.filter((col) => col.col_user_enabled);
  const activeColsIdx = index(activeCols, 'col_class_ID');

  return result
    .filter((facet) => facet.field_name in activeColsIdx)
    .map((facet) => {
      let col = activeColsIdx[facet.field_name];
      if (Array.isArray(col)) {
        col = col[0];
      }
      facet.col_type_filter = col.col_type_filter;
      facet.col_title = col.col_title;
      return facet;
    });
}
