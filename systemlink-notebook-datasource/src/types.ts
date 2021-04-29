import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface NotebookQuery extends DataQuery {
  path: string;
  parameters: any;
  output: string;
  cacheTimeout: number;
}

export const defaultQuery: Partial<NotebookQuery> = {
  path: '',
  parameters: {},
  output: '',
  cacheTimeout: 86400,
};

/**
 * These are options configured for each DataSource instance
 */
export interface NotebookDataSourceOptions extends DataSourceJsonData {}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface NotebookSecureJsonData {}

export interface Notebook {
  path: string;
  createdAt: string;
  updatedAt: string;
  parameters: { [key: string]: any };
  metadata: { [key: string]: any };
}

export interface Execution {
  notebookPath: string;
  parameters: { [key: string]: any };
  metadata: { [key: string]: any };
  status: 'QUEUED' | 'IN_PROGRESS' | 'FAILED' | 'SUCCEEDED' | 'CANCELED' | 'TIMED_OUT';
  exception: string;
  result: any;
  cachedResult: boolean;
}

export interface Parameter {
  id: string;
  display_name: string;
  type: string;
  options?: string[];
}

export interface NotebookParameterQuery {
  path: string;
  parameter: string;
}
