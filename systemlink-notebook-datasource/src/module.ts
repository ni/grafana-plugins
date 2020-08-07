// https://github.com/emotion-js/emotion/issues/1431
import {} from '@emotion/core';
import { DataSourcePlugin } from '@grafana/data';
import { DataSource } from './DataSource';
import { ConfigEditor } from './ConfigEditor';
import { QueryEditor } from './QueryEditor';
import { NotebookQuery, MyDataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<DataSource, NotebookQuery, MyDataSourceOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
