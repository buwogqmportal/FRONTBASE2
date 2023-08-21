import { APINotFoundError } from '$baselib/connection';
import { connectionSend } from '$baselib/stores';
import { convertTo } from '$baselib/util';
import { get } from 'svelte/store';

export type APIProcessItemCoordinatesRaw = {
  process_item_ID: string;
  process_item_coordinates_x: string;
  process_item_coordinates_y: string;
};

export type APIProcessItemCoordinates = {
  process_item_ID: string;
  process_item_coordinates_x: number;
  process_item_coordinates_y: number;
};

export const ProcessItemCoordinatesRequest = {
  fromJSON(json: APIProcessItemCoordinatesRaw): APIProcessItemCoordinates {
    return {
      ...json,
      process_item_coordinates_x: convertTo.local.number(json.process_item_coordinates_x),
      process_item_coordinates_y: convertTo.local.number(json.process_item_coordinates_y),
    };
  },

  toJSON(
    data: { process_ID?: string } & APIProcessItemCoordinates,
  ): { process_ID?: string } & APIProcessItemCoordinatesRaw {
    return {
      ...data,
      process_item_coordinates_x: convertTo.api.number(data.process_item_coordinates_x),
      process_item_coordinates_y: convertTo.api.number(data.process_item_coordinates_y),
    };
  },

  async set(
    process_ID: string,
    process_item_ID: string,
    process_item_coordinates_x: number,
    process_item_coordinates_y: number,
  ): Promise<void> {
    await get(connectionSend)<void>(
      'processitemcoordinates/set',
      ProcessItemCoordinatesRequest.toJSON({
        process_ID,
        process_item_ID,
        process_item_coordinates_x,
        process_item_coordinates_y,
      }),
    );
  },

  async setMultitle(process_ID: string, process_items: APIProcessItemCoordinates[]): Promise<void> {
    await get(connectionSend)<void>('processitemcoordinates/setmultiple', {
      process_ID,
      data: JSON.stringify(
        process_items.map(({ process_item_ID, process_item_coordinates_x, process_item_coordinates_y }) =>
          ProcessItemCoordinatesRequest.toJSON({
            process_item_ID,
            process_item_coordinates_x,
            process_item_coordinates_y,
          }),
        ),
      ),
    });
  },

  async get(process_item_ID: string): Promise<APIProcessItemCoordinates> {
    const response = await get(connectionSend)<APIProcessItemCoordinatesRaw>('processitemcoordinates/get', {
      process_item_ID,
    });

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return ProcessItemCoordinatesRequest.fromJSON(response.success.data);
  },

  async getAll(process_ID: string): Promise<APIProcessItemCoordinates[]> {
    const response = await get(connectionSend)<APIProcessItemCoordinatesRaw[]>('processitemcoordinates/getall', {
      process_ID,
    });

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return convertTo.local.array(response.success.data).map(ProcessItemCoordinatesRequest.fromJSON);
  },

  async update(
    process_ID: string,
    process_item_ID: string,
    process_item_coordinates_x: number,
    process_item_coordinates_y: number,
  ): Promise<boolean> {
    const response = await get(connectionSend)<boolean>(
      'processitemcoordinates/update',
      ProcessItemCoordinatesRequest.toJSON({
        process_ID,
        process_item_ID,
        process_item_coordinates_x,
        process_item_coordinates_y,
      }),
    );

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return response.success.data;
  },
};
