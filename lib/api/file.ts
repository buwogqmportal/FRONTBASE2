import { fileURL, sessionName } from '$baselib/config';
import { APIGenericError, APINotFoundError } from '$baselib/connection';
import { toArray } from '$baselib/util';
import { JSONConverter } from '$baselib/json';
import { get } from 'svelte/store';
import { connectionSend, state } from '$baselib/stores';

export enum APIFileViewRight {
  Uploader = '0',
  Employees = '100',
  Users = '200',
  Everyone = '900',
}

export type APIFile = {
  file_ID: string;
  file_name: string;
  file_extension: string;
  file_title?: string;
  file_type?: string;
  file_type_ID?: string;
  file_create: string;
};

export const FileRequest = {
  ...JSONConverter<APIFile>({
    file_ID: { type: 'string' },
    file_name: { type: 'string' },
    file_extension: { type: 'string' },
    file_title: { type: 'string' },
    file_type: { type: 'string' },
    file_type_ID: { type: 'string' },
    file_create: { type: 'string', info: true },
  }),

  /**
   * Get the URL of a file.
   */
  getURL(file_ID: string, { download = false } = {}): string {
    return `${fileURL}file/get/${file_ID}?${sessionName}=${get(state).session}${download ? '&download=1' : ''}`;
  },

  async getInfo(file_ID: string): Promise<APIFile> {
    const response = await get(connectionSend)<APIFile>('file/getinfo', { file_ID }, fileURL);

    if (response.status === 404) {
      throw new APINotFoundError();
    }

    return response.success.data;
  },

  async updateInfo(file: { file_ID: string } & Partial<APIFile>): Promise<void> {
    const response = await get(connectionSend)<APIFile>('file/updateinfo', file, fileURL);

    if (response.status === 404) {
      throw new APINotFoundError();
    }
  },

  /**
   * Gets all files with file_type and file_type_ID.
   */
  async getFileType(file_type: string, file_type_ID: string): Promise<APIFile[]> {
    const response = await get(connectionSend)<APIFile | APIFile[]>('file/getfiletype', { file_type, file_type_ID }, fileURL );

    if (response.status === 404) {
      return [];
    }

    return toArray(response.success.data);
  },

  async uploadBase64(
    file: Partial<APIFile> & { file_view_right?: APIFileViewRight; file_function?: string },
    dataURI: string,
  ): Promise<Record<string, string>> {
    console.log(fileURL);
    const response = await get(connectionSend)<Record<string, string>>('file/set', { ...file, file_base64: dataURI }, fileURL);

    if (response.status === 406) {
      throw new APIGenericError('file too large');
    }

    return response.success.data;
  },

  async del(file_ID: string): Promise<boolean> {
    const response = await get(connectionSend)<boolean>('file/delete', { file_ID }, fileURL);

    if (response.status === 404) {
      throw new APINotFoundError();
    }

    return response.success.data;
  },
};
