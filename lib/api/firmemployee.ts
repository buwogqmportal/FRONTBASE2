export type APIFirmEmployee = {
  user_ID: string;
  firm_employee_funtion: number;
  firm_employee_create: string;
  user_data?: {
    user_mail: string;
    user_personal_prename: string;
    user_personal_lastname: string;
    user_status: number;
  };
};
