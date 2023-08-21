import type { APIErrorMsg, APIResponse, APIValidationMessage } from './api';
import { serverURL, sessionName } from './config';

export class APIValidationError extends Error {
  public errors: Record<string, APIErrorMsg>;

  constructor(message: string, json: APIResponse<unknown>) {
    super(message);
    this.name = 'APIValidationError';

    const errorMessage = json.error?.message;

    if (typeof errorMessage === 'string') {
      const error = JSON.parse(json.error.message) as APIValidationMessage[];

      this.errors = Object.fromEntries(error.map(({ field, rule, param }) => [field, { rule, param }]));
    } else {
      this.errors = {};
    }
  }
}

export class APIAuthenticationError extends Error {
  constructor(message = '') {
    super(message);
    this.name = 'APIAuthenticationError';
  }
}

export class APINotFoundError extends Error {
  constructor(message = '') {
    super(message);
    this.name = 'APINotFoundError';
  }
}

export class APIRightsError extends Error {
  constructor(message = '') {
    super(message);
    this.name = 'APIRightsError';
  }
}

export class APIGenericError extends Error {
  constructor(message = '') {
    super(message);
    this.name = 'APINotFoundError';
  }
}

export class APIResponseError extends Error {
  constructor(message = '', public status: number) {
    super(message);
    this.name = 'APIResponseError';
  }
}

export class APIConflictingEntry extends Error {
  constructor(message = '', public status: number) {
    super(message);
    this.name = 'APIConflictingEntry';
  }
}

type Fetch = { session?: string; fetch?: (info: RequestInfo, init?: RequestInit) => Promise<Response>; url?: string };

export type ConnectionSend = <T = undefined>(
  path: string,
  body?: FormData | Record<string, unknown>,
  url?: string,
) => Promise<APIResponse<T>>;

export async function connectionSendPure(
  path: string,
  body: FormData | Record<string, unknown> = {},
  { session = '', fetch = window.fetch, url = serverURL }: Fetch = {},
): Promise<Response> {
  // convert to FormData
  let formdata: FormData;
  if (body instanceof FormData) {
    formdata = body;
  } else if (body && typeof body === 'object') {
    formdata = new FormData();

    for (const item in body) {
      if (Object.prototype.hasOwnProperty.call(body, item)) {
        const value = body[item];

        if (value === undefined || value === null || (typeof value === 'number' && isNaN(value))) continue;

        if (typeof value === 'object' && !Array.isArray(value) && !(value instanceof Blob)) {
          formdata.append(item, JSON.stringify(value));
        } else {
          formdata.append(item, value.toString());
        }
      }
    }
  }

  // add session
  if (session) {
    formdata.append(sessionName, session);
  }

  // send request
  const response = await fetch(url + path, {
    method: 'POST',
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      [sessionName]: session,
    },
    credentials: 'include',
    body: formdata,
  });

  // check for valation error
  if (response.status === 406) {
    throw new APIValidationError(`Validation for ${path} failed`, await response.json());
  }

  return response;
}
