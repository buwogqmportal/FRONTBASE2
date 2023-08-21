import { APINotFoundError } from '$baselib/connection';
import { connectionSend } from '$baselib/stores';
import { toArray } from '$baselib/util';
import { get } from 'svelte/store';

export type APIProcess = {
  process_ID: string;
  process_image: string;
  process_title: string;
  process_description: string;
  process_class: string;
  process_class_ID: string;
};

export abstract class ProcessRequest {
  static async set(
    process_title: string,
    process_description: string,
    process_class = '',
    process_class_ID = '',
  ): Promise<APIProcess> {
    const response = await get(connectionSend)<string>('process/set', {
      process_title,
      process_description,
      process_class,
      process_class_ID,
    });

    return {
      process_ID: response.success.data,
      process_title,
      process_image: '',
      process_description,
      process_class,
      process_class_ID,
    };
  }

  static async get(process_ID: string): Promise<APIProcess> {
    get(connectionSend);
    const response = await get(connectionSend)<APIProcess>('process/get', { process_ID });

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return response.success.data;
  }

  static async getAll(): Promise<APIProcess[]> {
    const response = await get(connectionSend)<APIProcess[]>('process/getall');

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return toArray(response.success.data);
  }

  static async getByClass(class_: string, class_ID: string): Promise<APIProcess[]> {
    const response = await get(connectionSend)<APIProcess[]>('process/getbyclass', { class: class_, class_ID });

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return toArray(response.success.data);
  }

  static async update(data: { process_ID: string } & Partial<APIProcess>): Promise<boolean> {
    const response = await get(connectionSend)<boolean>('process/update', data);

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return response.success.data;
  }

  static async del(process_ID: string): Promise<boolean> {
    const response = await get(connectionSend)<boolean>('process/delete', { process_ID });

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return response.success.data;
  }

  static async clone(process_ID: string): Promise<string> {
    const response = await get(connectionSend)<string>('process/clone', { process_ID });

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return response.success.data;
  }
}
