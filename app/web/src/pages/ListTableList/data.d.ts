import { CascaderOptionType } from 'antd'

export interface TableListItem {
  index?: number;
  domain: string;
  hl?: string;
  lr?: string;
  status?: number;
  updated_time?: Date;
  review?: string;
  rank?: number; // 计算重复次数
}

export interface TableListPagination {
  total: number;
  pageSize: number;
  current: number;
}

export interface TableListData {
  list: TableListItem[];
  pagination: Partial<TableListPagination>;
}

export interface TableListParams {
  sorter?: string;
  status?: string;
  lang?: string;
  first_category_id?: number;
  second_category_id?: number;
  third_category_id?: number;
  is_ww_ship?: number;
  is_uniq?: number;
  pageSize?: number;
  current?: number;
  review?: string;
}

export interface Category extends CascaderOptionType {
  value: number;
  label: string;
  children: Category[];
}
