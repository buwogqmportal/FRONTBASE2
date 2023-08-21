import { APINotFoundError } from '$baselib/connection';
import type { ConnectionSend } from '$baselib/connection';

export type APIUserMe = {
  user: {
    user_ID: string;
    user_type: string;
    user_mail: string;
    right_group_ID: string;
  };
  rights: Record<string, boolean>;
  user_data: {
    user_data_data: string;
    user_data_type_key: string;
    user_data_type_priority: string;
    user_data_type_title: string;
  }[];
};

export type APIUser = {
  external_user_ID: string;
  user_ID: string;
  user_type: string;
  user_personal_gender: string;
  user_personal_prename: string;
  user_personal_lastname: string;
  user_personal_image: string;
  user_personal_date_of_birth: string;
  user_personal_phone_1: string;
  user_personal_phone_2: string;
  user_personal_street: string;
  user_personal_zipcode: string;
  user_personal_city: string;
  user_mail: string;
  right_group_ID: string;
};

export type APIUserShort = {
  user_ID: string;
  user_personal_prename: string;
  user_personal_lastname: string;
  user_type: string;
};

export class UserRequest {
  constructor(private session: string, private connectionSend: ConnectionSend) {}

  static getUserLink(user: { user_type: string; user_ID: string }): string {
    switch (user.user_type) {
      case '0':
        return `/employee/details/${user.user_ID}`;

      case '1':
        return `/acquirer/details/${user.user_ID}`;

      case '4':
        return `/client/details/${user.user_ID}`;

      default:
        return '';
    }
  }

  async removeUser(user: { user_ID: string }): Promise<void> {
    const response = await this.connectionSend<APIUser>('user/delete', user);

    if (response.status === 404) {
      throw new APINotFoundError();
    }
  }

  async getMe(dataPriority: number = 2): Promise<APIUser> {
    const response = await this.connectionSend<APIUser>('user/get', { user_data_type_priority: dataPriority });

    if (response.status === 404) {
      throw new APINotFoundError();
    }

    return response.success.data;
  }
}
