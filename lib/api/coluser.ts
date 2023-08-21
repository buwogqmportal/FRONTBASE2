import { APINotFoundError } from '$baselib/connection';
import type { ConnectionSend } from '$baselib/connection';

export type APIColuser = {
  col_class_ID: string;
  col_title: string;
  col_title_show: '1' | '0' | '';
  col_type: string;
  col_type_display: string;
  col_user_enabled: boolean;
  col_type_filter?: 'hidden' | 'date' | 'multiselect';
  value?: string[];
};

export class ColuserRequest {
  constructor(private session: string, private connectionSend: ConnectionSend) {}

  async getall(col_class: string): Promise<APIColuser> {
    const response = await this.connectionSend<APIColuser>('coluser/getall', { col_class });

    if (response.status === 404) {
      throw new APINotFoundError();
    }

    return response.success.data;
  }

  async updateall(col_class: string, data: { col_class_ID: string; col_user_sort: string | number }[]): Promise<void> {
    const response = await this.connectionSend<boolean>('coluser/updateall', { col_class, data: JSON.stringify(data) });

    if (response.status === 404) {
      throw new APINotFoundError();
    }
  }
}

export type APIColuserParsed = APIColuser & { display: TypeDisplay };

export type TypeDisplay = {
  type: string;
  info: string;
  values: string[];
};

export function parseTypeDisplay(typeDisplay: string, fallback: string): TypeDisplay {
  const [typeInfo, values] = typeDisplay.split('=');

  const [type, info] = typeInfo.split('#');

  return {
    type,
    info,
    values: (values || fallback).split(','),
  };
}

export function parseColuser(col: APIColuser): APIColuserParsed {
  if (!col) return undefined;
  return { ...col, display: parseTypeDisplay(col.col_type_display, col.col_class_ID) };
}
