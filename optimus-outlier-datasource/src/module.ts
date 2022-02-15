import { DataSourcePlugin } from '@grafana/data';
import { DataSource } from './datasource';
import { ConfigEditor } from './ConfigEditor';
import { QueryEditor } from './QueryEditor';
import { FilterWafersQuery, OutlierDetectionServerOptions } from './types';

export const plugin = new DataSourcePlugin<DataSource, FilterWafersQuery, OutlierDetectionServerOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
