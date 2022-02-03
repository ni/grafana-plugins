import { DataSourceVariableSupport } from '@grafana/data';
import { NotebookQuery } from 'types';
import { DataSource } from './DataSource';

export class NotebookVariableSupport extends DataSourceVariableSupport<DataSource, NotebookQuery> {}
