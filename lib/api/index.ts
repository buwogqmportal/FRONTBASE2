import type { APINotFoundError, APIResponseError, APIValidationError } from '$baselib/connection';

export type APIResponse<T = boolean> = {
  success?: {
    data: T;
    session: string;
  };
  error?: {
    status: number;
    message: string;
  };
  status: number;
  response: Response;
};

export type APISuccessfulResponse<T> = {
  success: {
    data: T;
  };
};

export type APIValidationMessage = {
  field: string;
  value: unknown;
  rule: string;
  param: string;
};

export type APIError = APIResponseError | APIValidationError | APINotFoundError | TypeError;

export type APIErrorMsg = { rule: string; param?: string };

export abstract class APIObject {}
