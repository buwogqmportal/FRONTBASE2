import { APINotFoundError } from '$baselib/connection';
import type { ConnectionSend } from '$baselib/connection';
import type { APIRight } from './right';
import type { APIUserShort } from './user';
import { convertTo } from '$baselib/util';
import { get } from 'svelte/store';
import { connectionSend } from '$baselib/stores';

export type APIRightsGroupJSON = {
  rights_group_ID: string;
  rights_group_title: string;
  rights_group_description: string;
  rights_system: string;
  rights_group_active: string;
};

export type APIRightsGroup = {
  rights_group_ID: string;
  rights_group_title: string;
  rights_group_description: string;
  rights_system: boolean;
  rights_group_active: boolean;
};

export const RightsGroupRequest = {
  fromJSON(json: APIRightsGroupJSON): APIRightsGroup {
    return {
      ...json,
      rights_system: convertTo.local.boolean(json.rights_system),
      rights_group_active: convertTo.local.boolean(json.rights_group_active),
    };
  },

  toJSON(data: Partial<APIRightsGroup>): Partial<APIRightsGroupJSON> {
    return {
      ...data,
      rights_system: convertTo.api.boolean(data.rights_system),
      rights_group_active: convertTo.api.boolean(data.rights_group_active),
    };
  },

  async getSetRights(group_ID: string): Promise<Record<string, APIRight[]>> {
    const response = await get(connectionSend)<Record<string, APIRight[]>>('rightsgroup/getallrights/' + group_ID);

    if (response.status === 404) {
      throw new APINotFoundError();
    }

    return response.success.data;
  },

  async getUnsetRights(group_ID: string): Promise<Record<string, APIRight[]>> {
    const response = await get(connectionSend)<Record<string, APIRight[]>>('rightsgroup/getunsetrights/' + group_ID);

    if (response.status === 404) {
      throw new APINotFoundError();
    }

    return response.success.data;
  },

  async getConnectedUsers(group_ID: string): Promise<APIUserShort[]> {
    const response = await get(connectionSend)<APIUserShort[]>('rightsgroup/getuserbygroup/' + group_ID);

    if (response.status === 404) {
      throw new APINotFoundError();
    }

    return convertTo.local.array(response.success.data);
  },

  async set(data: Omit<APIRightsGroup, 'rights_group_ID'>): Promise<string> {
    const response = await get(connectionSend)<string>('rightsgroup/set', RightsGroupRequest.toJSON(data));

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return response.success.data;
  },

  async setRights(rights_group_ID: string, right_ID: string | string[]): Promise<string> {
    const response = await get(connectionSend)<string>('rightsgroup/setrights', {
      right_ID: Array.isArray(right_ID) ? right_ID.join(',') : right_ID,
      rights_group_ID,
    });

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return response.success.data;
  },

  async delRights(rights_group_ID: string, right_ID: string | string[]): Promise<string> {
    const response = await get(connectionSend)<string>('rightsgroup/deleterights', {
      right_ID: Array.isArray(right_ID) ? right_ID.join(',') : right_ID,
      rights_group_ID,
    });

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return response.success.data;
  },

  async update(rights_group: { rights_group_ID: string } & Partial<APIRightsGroup>): Promise<void> {
    const response = await get(connectionSend)<APIRightsGroup>('rightsgroup/update', rights_group);

    if (response.status === 404) {
      throw new APINotFoundError();
    }
  },

  async del(rights_group_ID: string) {
    const response = await get(connectionSend)<APIRightsGroup>('rightsgroup/delete', { rights_group_ID });

    if (response.status === 404) {
      throw new APINotFoundError();
    }
  },

  async clone(source_rights_group_ID: string, data: Omit<APIRightsGroup, 'rights_group_ID'>): Promise<string> {
    const target_rights_group_ID = await RightsGroupRequest.set(data);

    const rightsGroups = RightsGroupRequest.getSetRights(source_rights_group_ID);

    const allRightFunctions = Object.values(rightsGroups)
      .flat()
      .map((right) => right.right_ID);

    await RightsGroupRequest.setRights(target_rights_group_ID, allRightFunctions);

    return target_rights_group_ID;
  },
};
