import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface FilterWafersQuery extends DataQuery {
  requestType: RequestType;
  product?: string;
  operation?: string;
  lot?: string;
  testProgram?: string;
  filterOutGoodDice: boolean;
  waferDiceId?: string;
  waferId?: string;
}

export enum RequestType {
  GetWafersList = "Get wafer list",
  GetWafer = "Get wafer",
  GetDice = "Get dice"
}

export const defaultQuery: Partial<FilterWafersQuery> = {
  requestType: RequestType.GetDice,
  filterOutGoodDice: false
};

export interface Wafer {
  id: string;
  name: string;
  source: string;
  yieldBefore: string;
  totalGoodUnits: string;
  yieldAfterGDBN: string;
  yieldLoss: string;
  totalOutliers: string;
  resultDate: Date;
  dice: Die[];
}

export interface Die {
  x: number;
  y: number;
  type: DieType;
}

export enum DieType {
  Good,
  Bad,
  Outlier
}

/**
 * These are options configured for each DataSource instance
 */
export interface OutlierDetectionServerOptions extends DataSourceJsonData {
  url?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface OutlierSecureJsonData {
  apiKey?: string;
}
