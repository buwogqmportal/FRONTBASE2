import { APINotFoundError, type ConnectionSend } from '$baselib/connection';

export enum APITemplateType {
  EMail = '2',
  Web = '11',
}

export type APITemplate = {
  template_ID: string;
  template_type_ID: string;
  template_key: string;
  template_title: string;
  template_description: string;
  template_language: string;
  template_data_1: string;
  template_data_2: string;
  template_data_3?: string;
  template_config?: string;
  template_active: string;
  template_system: string;
  template_status: string;
  template_create?: string;
};

export class TemplateRequest {
  constructor(private session: string, private connectionSend: ConnectionSend) {}

  async setTemplate(data: FormData): Promise<string> {
    const response = await this.connectionSend<string>('template/set', data);

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return response.success.data;
  }

  async updateTemplate(template: { template_ID: string } & Partial<APITemplate>): Promise<void> {
    const response = await this.connectionSend<APITemplate>('template/update', template);

    if (response.status === 404) {
      throw new APINotFoundError();
    }
  }

  async deleteTemplate(template: { template_ID: string }) {
    const response = await this.connectionSend<APITemplate>('template/delete/' + template.template_ID, template);

    if (response.status === 404) {
      throw new APINotFoundError();
    }
  }
}
