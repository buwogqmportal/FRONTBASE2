import { searchURL, sessionName } from '$baselib/config';
import { APINotFoundError, APIResponseError } from '$baselib/connection';
import type { FilterValues } from '$baselib/filter';
import { parseRelativeDate } from '$baselib/formater';
import { state } from '$baselib/stores';
import { deepAssign } from '$baselib/util';
import { get } from 'svelte/store';
import type { APIColuser } from './coluser';

export type APISearchResult = {
  hits: APISearchResultHit[];
  page?: number;
  out_of?: number;
  found: number;
  facet_counts?: APISearchResultFacet[];
  code?: number;
  error?: string;
};

export type APISearchResultHit = { document: Record<string, string> };
export type APISearchResultFacet = {
  counts: { count: number; highlighted: string; value: string }[];
  field_name: string;
  stats: { total_values: number };
  col_type_filter?: string;
  col_title?: string;
};

export type SearchDocuments = (
  collection: string,
  cols: string[],
  search: string,
  filter?: string,
  per_page?: number,
) => Promise<APISearchResult>;

export const PAGINATION_PER_PAGE = 25;

export type SearchRequest = {
  collection: string;
  q: string;
  facet_by: string;
  query_by: string;
  per_page: number;
  page: number;
  max_facet_values: number;
  filter_by: string;
  sort_by: string;
};

export type SearchQueryType = (...searches: SearchRequest[]) => Promise<APISearchResult[]>;

export async function searchQuery(...searches: SearchRequest[]): Promise<APISearchResult[]> {
  const res = await fetch(searchURL, {
    method: 'POST',
    credentials: 'include',
    headers: { [sessionName]: get(state).session, 'Cache-Control': 'no-cache, no-store, must-revalidate' },
    body: JSON.stringify({
      searches: searches.filter((search) => typeof search === 'object'),
    }),
  });

  const json = await res.json();
  const results = json.success.data.results as APISearchResult[];

  for (const result of results) {
    if (result.code === 404) {
      throw new APINotFoundError();
    } else if (result.code >= 400) {
      throw new APIResponseError(result.error, result.code);
    }
  }

  for (let i = results.length; i < searches.length; i++) {
    results.push({
      hits: [],
      found: 0,
    });
  }

  return results;
}

export type SearchRequestOptions = {
  per_page?: number;
  search?: string;
};

export async function searchSingleQuery(
  collection: string,
  cols: string[],
  page = 1,
  options: SearchRequestOptions = {},
  ...operations: SearchRequestOperation[]
): Promise<APISearchResult> {
  return (await searchQuery(search(collection, cols, page, options, ...operations)))[0];
}

export type SearchRequestOperation = (data: SearchRequest) => SearchRequest;

export function search(
  collection: string,
  cols: string[],
  page: number = 1,
  options: SearchRequestOptions = {},
  ...operations: SearchRequestOperation[]
): SearchRequest {
  options = { per_page: PAGINATION_PER_PAGE, search: '', ...options };

  return operations.filter(Boolean).reduce((acc, el) => el(acc), {
    collection,
    q: options.search,
    facet_by: cols.flatMap((col) => [col, col + '_sort']).join(),
    query_by: cols.join(),
    per_page: options.per_page,
    page: page,
    max_facet_values: 250,
    filter_by: '',
    sort_by: '',
  });
}

function appendStringList(list: string, seperator: string, ...el: string[]): string {
  if (list.length > 0) return list + seperator + el.filter((value) => value).join(seperator);
  else return el.filter((value) => value).join(seperator);
}

function sortByOrder(desc = true): string {
  if (desc) return 'desc';
  else return 'asc';
}

export function sortByTextMatch(desc = true): SearchRequestOperation {
  return (data) => ({
    ...data,
    sort_by: appendStringList(data.sort_by, ',', `_text_match:${sortByOrder(desc)}`),
  });
}

export function sortByField(field: string, desc = true): SearchRequestOperation {
  if (!field) return (data) => data;
  return (data) => ({
    ...data,
    sort_by: appendStringList(data.sort_by, ',', `${field}_sort:${sortByOrder(desc)}`),
  });
}

export function filter(name: string, ...values: string[]): SearchRequestOperation {
  return (data) => ({
    ...data,
    filter_by: appendStringList(data.filter_by, '&&', `${name}:[${values.filter((value) => value).join()}']`),
  });
}

export function filterDateRange(name: string, from = '', to = ''): SearchRequestOperation {
  const fromSec = parseRelativeDate(from)?.toSeconds();
  const toSec = parseRelativeDate(to)?.toSeconds();

  return filterRange(name, fromSec, toSec);
}

export function filterRange(name: string, from: number, to: number): SearchRequestOperation {
  return (data) => ({
    ...data,
    filter_by: appendStringList(
      data.filter_by,
      '&&',
      from ? `${name}_sort:>=${from}` : undefined,
      to ? `${name}_sort:<${to}` : undefined,
    ),
  });
}

export function getFilterFromValuesAndCriteria(
  filterValues: FilterValues,
  cols: APIColuser[],
): SearchRequestOperation[] {
  if (!cols || cols.length === 0) return [];

  const filterMergeResult: SearchRequestOperation[] = [];

  for (const criteria of cols) {
    let values = filterValues[criteria.col_class_ID];
    if (values && values.length > 0) {
      if (criteria.col_type_filter === 'date') {
        filterMergeResult.push(filterDateRange(criteria.col_class_ID, values[0] ?? '', values[1] ?? ''));
      } else if (criteria.col_type_filter === 'multiselect') {
        filterMergeResult.push(filter(criteria.col_class_ID, ...values.filter((v) => v)));
      }
    }
  }

  return filterMergeResult;
}

export const mutateSearchResult = {
  setHit(insert: APISearchResultHit): (oldData: APISearchResult) => APISearchResult {
    return (oldData) => {
      if (!oldData) return;
      return {
        ...oldData,
        hits: oldData.hits.concat(insert),
      };
    };
  },

  updateHit(
    update: APISearchResultHit,
    where: (data: APISearchResultHit) => boolean,
  ): (oldData: APISearchResult) => APISearchResult {
    return (oldData) => {
      if (!oldData) return;
      return {
        ...oldData,
        hits: oldData.hits.map((data) => (where(data) ? deepAssign({}, data, update) : data)),
      };
    };
  },

  delHit(where: (data: APISearchResultHit) => boolean): (oldData: APISearchResult) => APISearchResult {
    return (oldData) => {
      if (!oldData) return;
      return {
        ...oldData,
        hits: oldData.hits.filter(where),
      };
    };
  },
};
