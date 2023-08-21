import { APINotFoundError } from '$baselib/connection';
import type { FilterValues } from '$baselib/filter';
import { connectionSend } from '$baselib/stores';
import { convertTo } from '$baselib/util';
import { get } from 'svelte/store';

export type APIColfilterRaw = {
  col_class_ID: string;
  col_user_filter_data: string;
};

export type APIColfilter = {
  col_class_ID: string;
  col_user_filter_data: string[];
};

export const ColuserfilterRequest = {
  fromJSON(json: APIColfilterRaw): APIColfilter {
    return { ...json, col_user_filter_data: JSON.parse(json.col_user_filter_data) };
  },

  toJSON(data: APIColfilter): APIColfilterRaw {
    return { ...data, col_user_filter_data: JSON.stringify(data.col_user_filter_data) };
  },

  async getAll(col_class: string): Promise<APIColfilter[]> {
    const response = await get(connectionSend)<APIColfilterRaw[]>('coluserfilter/getall', { col_class });

    if (response.status === 404) {
      throw new APINotFoundError(response.error.message);
    }

    return convertTo.local.array(response.success.data).map(ColuserfilterRequest.fromJSON);
  },

  async updateAll(col_class: string, data: APIColfilter[]): Promise<void> {
    const response = await get(connectionSend)<boolean>('coluserfilter/updateall', {
      col_class,
      data: JSON.stringify(data.map(ColuserfilterRequest.toJSON)),
    });

    if (response.status === 404) {
      throw new APINotFoundError();
    }
  },

  async getAllFilterValues(col_class: string): Promise<FilterValues> {
    const filterValues = await ColuserfilterRequest.getAll(col_class);
    return filterValues.reduce((obj, elem) => {
      obj[elem.col_class_ID] = elem.col_user_filter_data;
      return obj;
    }, {});
  },

  async updateAllFilterValues(col_class: string, filterValues: FilterValues): Promise<void> {
    const data = Object.entries<string[]>(filterValues).map(([key, value]) => ({
      col_class_ID: key,
      col_user_filter_data: value,
    }));
    await ColuserfilterRequest.updateAll(col_class, data);
  },
};
