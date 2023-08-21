import { APINotFoundError } from '$baselib/connection';
import { JSONConverter, JSONArrayConverter } from '$baselib/json';
import { connectionSend } from '$baselib/stores';
import { convertTo, indexSingle } from '$baselib/util';
import { get } from 'svelte/store';
import type { APIProcess } from './process';
import type { APIProcessComponent } from './processcomponent';
import { type APIProcessItemCoordinates, ProcessItemCoordinatesRequest } from './processitemcoordinates';

type APIProcessItemRequired = {
  process_ID: string;
  process_item_ID: string;
  process_item_title: string;
  process_component_ID: string;
};

type APIProcessItemOptional = {
  process_item_close_other: boolean;
  process_item_runtime_date: Date;
  process_item_runtime_day: number;
  process_item_show: boolean;
};

type APIProcessItemInfo = {
  process_component: APIProcessComponent;
  process_item_create_time: Date;
  process_item_status: string;
};

type APIProcessItemInfoRaw = {
  process: APIProcess;
  process_component_parameter: APIProcessComponentParameter[];
};

export type APIProcessComponentParameter = {
  process_component_element_group_ID: string;
  process_component_element_group_description: string;
  process_component_element_group_title: string;
  process_component_element: {
    process_component_ID: string;
    process_component_element_description: string;
    process_component_element_function: string;
    process_component_element_group_ID: string;
    process_component_element_key: string;
    process_component_element_sort: number;
    process_component_element_system: boolean;
    process_component_element_title: string;
    process_component_element_type: string;
    process_component_element_validate: string;
    process_item_data_data: string;
  }[];
};

export type APIProcessItem = APIProcessItemRequired &
  Partial<APIProcessItemOptional> &
  APIProcessItemInfo &
  Partial<APIProcessItemInfoRaw>;

export type APIProcessItemWithCoordinates = APIProcessItem & { coordinates?: APIProcessItemCoordinates };

export const ProcessItemRequest = {
  ...JSONConverter<APIProcessItem>({
    process_ID: { type: 'string' },
    process_item_ID: { type: 'string' },
    process_item_title: { type: 'string' },
    process_component_ID: { type: 'string' },
    process_item_close_other: { type: 'boolean' },
    process_item_runtime_date: { type: 'date' },
    process_item_runtime_day: { type: 'number' },
    process_item_show: { type: 'boolean' },
    process_component: { info: true },
    process_component_parameter: {
      type: 'array',
      info: true,
      ...JSONArrayConverter({
        process_component_element_group_ID: { type: 'string' },
        process_component_element_group_description: { type: 'string' },
        process_component_element_group_title: { type: 'string' },
        process_component_element: {
          type: 'array',
          ...JSONArrayConverter({
            process_component_ID: { type: 'string' },
            process_component_element_description: { type: 'string' },
            process_component_element_function: { type: 'string' },
            process_component_element_group_ID: { type: 'string' },
            process_component_element_key: { type: 'string' },
            process_component_element_sort: { type: 'number' },
            process_component_element_system: { type: 'boolean' },
            process_component_element_title: { type: 'string' },
            process_component_element_type: { type: 'string' },
            process_component_element_validate: { type: 'string' },
            process_item_data_data: { type: 'string' },
          }),
        },
      }),
    },
    process_item_create_time: { type: 'date', info: true },
    process_item_status: { type: 'string', info: true },
  }),

  async set(
    process_ID: string,
    process_item_title: string,
    process_component_ID: string,
    {
      process_item_show,
      process_item_close_other,
      process_item_runtime_day,
      process_item_runtime_date,
    }: Partial<APIProcessItemOptional> = {},
  ): Promise<string> {
    const response = await get(connectionSend)<string>(
      'processitem/set',
      ProcessItemRequest.toJSON({
        process_ID,
        process_item_ID: undefined,
        process_item_title,
        process_item_show,
        process_item_close_other,
        process_item_runtime_day,
        process_item_runtime_date,
        process_component_ID,
      }),
    );

    return response.success.data;
  },

  async get(process_item_ID: string, rawdata = false): Promise<APIProcessItem> {
    const response = await get(connectionSend)('processitem/get', { process_item_ID, rawdata });

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return ProcessItemRequest.fromJSON(response.success.data);
  },

  async getAll(process_ID: string): Promise<APIProcessItem[]> {
    const response = await get(connectionSend)<APIProcessItem[]>('processitem/getall', { process_ID });

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return convertTo.local.array(response.success.data);
  },

  async getAllWithCoordinates(process_ID: string): Promise<APIProcessItemWithCoordinates[]> {
    const [items, coords] = (await Promise.all([
      ProcessItemRequest.getAll(process_ID),
      ProcessItemCoordinatesRequest.getAll(process_ID),
    ])) as [APIProcessItemWithCoordinates[], APIProcessItemCoordinates[]];

    const coordsNumIdx = indexSingle(coords, 'process_item_ID');

    for (const item of items) {
      item.coordinates = coordsNumIdx[item.process_item_ID];
    }

    return items;
  },

  async update(
    data: { process_item_ID: string } & Partial<APIProcessItemRequired | APIProcessItemOptional>,
  ): Promise<boolean> {
    const response = await get(connectionSend)<boolean>(
      'processitem/update',
      ProcessItemRequest.toJSON({
        process_ID: undefined,
        process_item_title: undefined,
        process_component_ID: undefined,
        ...data,
      }),
    );

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return response.success.data;
  },

  async del(process_item_ID: string): Promise<boolean> {
    const response = await get(connectionSend)<boolean>('processitem/delete', {
      process_item_ID,
    });

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return response.success.data;
  },

  async clone(process_ID: string, process_item_ID: string): Promise<string> {
    const response = await get(connectionSend)<string>('processitem/clone', {
      process_ID,
      process_item_ID,
    });

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return response.success.data;
  },
};

export type APIProcessItemConnection = {
  process_item_from_ID: string;
  process_item_from_name: string;
  process_item_to_ID: string;
  process_item_to_name: string;
};

export abstract class ProcessItemConnectionRequest {
  static async set(
    process_item_from_ID: string,
    process_item_from_name: string,
    process_item_to_ID: string,
    process_item_to_name: string,
  ): Promise<APIProcessItemConnection> {
    await get(connectionSend)<string>('processitemconnection/set', {
      process_item_from_ID,
      process_item_from_name,
      process_item_to_ID,
      process_item_to_name,
    });

    return {
      process_item_from_ID,
      process_item_from_name,
      process_item_to_ID,
      process_item_to_name,
    };
  }

  static async getAll(): Promise<APIProcessItemConnection[]> {
    const response = await get(connectionSend)<APIProcessItemConnection[]>('processitemconnection/getall');

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return convertTo.local.array(response.success.data);
  }

  static async getAllByProcess(process_ID: string): Promise<APIProcessItemConnection[]> {
    const response = await get(connectionSend)<APIProcessItemConnection[]>('processitemconnection/getallbyprocess', {
      process_ID,
    });

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return convertTo.local.array(response.success.data);
  }

  static async del(
    process_item_from_ID: string,
    process_item_from_name: string,
    process_item_to_ID: string,
    process_item_to_name: string,
  ): Promise<boolean> {
    const response = await get(connectionSend)<boolean>('processitemconnection/delete', {
      process_item_from_ID,
      process_item_from_name,
      process_item_to_ID,
      process_item_to_name,
    });

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return response.success.data;
  }
}
