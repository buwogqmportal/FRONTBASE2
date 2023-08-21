import { APINotFoundError } from '$baselib/connection';
import type { ConnectionSend } from '$baselib/connection';
import { get } from 'svelte/store';
import { connectionSend } from '$baselib/stores';

export type APIRight = {
  right_ID: string;
  right_class: string;
  right_function: string;
  right_description: string;
};

export const RightRequest = {
  async set(data: { right_class: string; right_function: string; right_description: string }): Promise<string> {
    const response = await get(connectionSend)<string>('right/set', data);

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return response.success.data;
  },

  async update(right: { right_ID: string } & Partial<APIRight>): Promise<void> {
    const response = await get(connectionSend)<APIRight>('right/update', right);

    if (response.status === 404) {
      throw new APINotFoundError();
    }
  },

  async del(right_ID: string) {
    const response = await get(connectionSend)<APIRight>('right/delete', { right_ID });

    if (response.status === 404) {
      throw new APINotFoundError();
    }
  },
};
