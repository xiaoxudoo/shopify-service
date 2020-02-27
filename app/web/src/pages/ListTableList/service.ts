import request from '@/utils/request';
import { TableListParams } from './data.d';
import { getCookie } from '@/utils/utils';

export async function queryShopify(params?: TableListParams) {
  return request('/api/shopify', {
    params,
  });
}

export async function fetchCategory() {
  return request('/api/category');
}

export async function updateStatus(params: TableListParams) {
  return request('/api/updateStatus', {
    method: 'post',
    data: params,
    headers: {
      'x-csrf-token': getCookie('csrfToken')
    }
  });
}
