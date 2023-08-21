import { APINotFoundError } from '$baselib/connection';
import type { ConnectionSend } from '$baselib/connection';
import type { APIUser } from './user';

//TODO: eigentlich lieber über die DB lösen
export enum APIDefectStatus {
  Initial = '0',
  Progress = '1',
  Done = '4',
  Canceled = '3',
}

export type APIDefect = {
  defect_ID: string;
  defect_status: string;
  project_ID: string;
  project_title: string;
  defect_description: string;
  defect_extern_ID: string;
  defect_title: string;
  firm_ID: string;
  firm_data: {
    firm_ID: string;
    firm_title: string;
    firm_data: {
      firm_city: string;
      firm_zipcode: string;
      firm_street: string;
    };
  };
  defect_data: {
    defect_building: string;
    defect_floor: string;
    defect_category: string;
    defect_phase: string;
    defect_deadline: string;
    defect_priority: string;
    defect_description_ID: string;
    defect_client_status: string;
    trade_ID: string;
    trade_title: string;
  };
  acquirer_data: APIUser;
  space: {
    space_ID: string;
    space_title: string;
  };
};

export type defectData = {
  hits: [
    {
      document: {
        defect_ID: string;
        defect_building: string;
        defect_category: string;
        defect_description: string;
        defect_floor: string;
        defect_priority: string;
      };
    },
  ];
};

export class DefectRequest {
  constructor(private session: string, private connectionSend: ConnectionSend) {}

  async removeDefect(defect: { defect_ID: string }) {
    const response = await this.connectionSend<APIDefect>('defect/delete', defect);

    if (response.status === 404) {
      throw new APINotFoundError();
    }
  }
}
