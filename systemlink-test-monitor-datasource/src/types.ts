import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface TestMonitorQuery extends DataQuery {
  queryText?: string;
  constant: number;
}

export const defaultQuery: Partial<TestMonitorQuery> = {
  constant: 6.5,
};

/**
 * These are options configured for each DataSource instance
 */
export interface TestMonitorDataSourceOptions extends DataSourceJsonData {}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface TestMonitorSecureJsonData {}

export interface TestMonitorVariableQuery {
  field: string;
}
