import { DataSourcePlugin } from '@grafana/data';
import { DataSource } from './DataSource';
import { ConfigEditor } from './ConfigEditor';
import { QueryEditor } from './QueryEditor';
import { NotebookQuery, NotebookDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<DataSource, NotebookQuery, NotebookDataSourceOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
