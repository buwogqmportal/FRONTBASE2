import { APINotFoundError, APIResponseError } from '$baselib/connection';
import type { ConnectionSend } from '$baselib/connection';
import type { APIFirmEmployee } from './firmemployee';

export type APIFirm = {
  firm_ID: string;
  firm_title: string;
  firm_description: string;
  firm_status: number;
  firm_create_timestamp: string;
  firm_external_ID: string;
  firm_data: {
    firm_city: string;
    firm_e_mail: string;
    firm_image: string;
    firm_phone: string;
    firm_street: string;
    firm_zipcode: string;
  };
  firm_employees: APIFirmEmployee[];
};

export type APIFirmTrade = {
  project_ID: string;
  project_data_value: string;
  trades_ID: string;
  trades_title: string;
};

export class FirmRequest {
  constructor(private session: string, private connectionSend: ConnectionSend) {}

  async deleteFirm(firm_ID: string): Promise<void> {
    const response = await this.connectionSend<void>('firm/delete', { firm_ID });

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }
  }

  async setEmployee(data: { user_ID: string; firm_ID: string; firm_employee_function: string }): Promise<string> {
    const response = await this.connectionSend<string>('firmemployee/set', data);

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    return response.success.data;
  }

  async deleteEmployee(data: { user_ID: string; firm_ID: string }): Promise<void> {
    const response = await this.connectionSend<void>('firmemployee/delete', data);

    if (response.status === 404) {
      throw new APINotFoundError(response?.error.message);
    }

    if (response.status === 400) {
      throw new APIResponseError(response.error.message, response.error.status);
    }
  }
}
