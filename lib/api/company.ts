import { browser } from '$app/env';
import { connectionSend, userHasRight } from '$baselib/stores';
import { convertTo } from '$baselib/util';
import { useQuery } from '@sveltestack/svelte-query';
import { get } from 'svelte/store';
import type { APIError } from '.';

export type APICompanyUrlType = {
  company_url_type_ID: string;
  company_url_type_description: string;
};

export const CompanyUrlTypeRequest = {
  async getAll(): Promise<APICompanyUrlType[]> {
    const response = await get(connectionSend)<APICompanyUrlType[]>('companyurltype/getall');

    return convertTo.local.array(response.success.data);
  },
};

export const UseCompanyUrlTypeQuery = {
  getAll() {
    return useQuery<APICompanyUrlType[], APIError>(UseCompanyUrlTypeQuery.getAll_options());
  },

  getAll_options() {
    return {
      queryKey: UseCompanyUrlTypeQuery.getAll_key(),
      queryFn: () => CompanyUrlTypeRequest.getAll(),
      enabled: browser && get(userHasRight)('companyurltype', 'getall'),
    };
  },

  getAll_key() {
    return ['companyurltype/getall'];
  },
};
