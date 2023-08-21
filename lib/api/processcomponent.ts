import { APINotFoundError } from '$baselib/connection';
import { connectionSend } from '$baselib/stores';
import { convertTo, toArray } from '$baselib/util';
import { get } from 'svelte/store';

export type APIProcessComponentType = {
  process_component_type_ID: string;
  process_component_type_title: string;
  process_component_type_color: string;
  process_component: APIProcessComponent[];
};

export type APIProcessComponent = {
  input: APIProcessComponentElement[];
  output: APIProcessComponentElement[];
  process_component_ID: string;
  process_component_description?: string;
  process_component_function?: string;
  process_component_title: string;
  process_component_type_ID: string;
  process_component_type: {
    process_component_type_ID: string;
    process_component_type_title: string;
    process_component_type_color: string;
  };
  template_key: string;
};

export type APIProcessComponentElement = {
  process_component_element_function: string;
  process_component_element_key: string;
  process_component_element_title: string;
};

export const ProcessComponentRequest = {
  typeFromJSON(json: APIProcessComponentType): APIProcessComponentType {
    return {
      ...json,
      process_component: convertTo.local.array(json.process_component),
    };
  },

  async get(process_component_ID: string): Promise<APIProcessComponent> {
    const response = await get(connectionSend)<APIProcessComponent>('processcomponent/get', { process_component_ID });

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return response.success.data;
  },

  async getAll(): Promise<APIProcessComponentType[]> {
    const response = await get(connectionSend)<APIProcessComponentType[]>('processcomponent/getall');

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return toArray(response.success.data).map((t) => ProcessComponentRequest.typeFromJSON(t));
  },

  async update(data: { process_component_ID: string } & Partial<APIProcessComponent>): Promise<boolean> {
    const response = await get(connectionSend)<boolean>('processcomponent/update', data);

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return response.success.data;
  },

  async del(process_component_ID: string): Promise<boolean> {
    const response = await get(connectionSend)<boolean>('processcomponent/delete', {
      process_component_ID,
    });

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return response.success.data;
  },
};
