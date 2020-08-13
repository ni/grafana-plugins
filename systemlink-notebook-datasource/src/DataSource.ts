/**
 * DataSource is a TypeScript class that implements the logic for executing and querying
 * notebooks. The 'query' method is called from Grafana's internals when a panel requests data.
 */
import defaults from 'lodash/defaults';

import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';

import { getBackendSrv } from '@grafana/runtime';

import { NotebookQuery, NotebookDataSourceOptions, defaultQuery, Notebook, Execution } from './types';

export class DataSource extends DataSourceApi<NotebookQuery, NotebookDataSourceOptions> {
  url?: string;

  constructor(instanceSettings: DataSourceInstanceSettings<NotebookDataSourceOptions>) {
    super(instanceSettings);
    this.url = instanceSettings.url;
  }

  async query(options: DataQueryRequest<NotebookQuery>): Promise<DataQueryResponse> {
    // const { range } = options;
    // const from = range!.from.valueOf();
    // const to = range!.to.valueOf();

    // Assume one target for now, TODO: bubble up error AB#1108330
    const target = options.targets[0];
    const query = defaults(target, defaultQuery);

    if (!query.path) {
      return { data: [] };
    }

    const execution = await this.executeNotebook(query.path, query.parameters);
    if (execution.status === 'SUCCEEDED') {
      // TODO: Verify result object AB#1108330
      const result = execution.result.result.find((result: any) => result.id === query.output);
      const frame = this.transformResultToDataFrame(result, query);
      return { data: [frame] };
    } else {
      return { data: [], error: { message: 'The notebook failed to execute.' } };
    }
  }

  private transformResultToDataFrame(result: any, query: NotebookQuery) {
    const frame = new MutableDataFrame({
      refId: query.refId,
      fields: [],
    });

    if (result.type === 'data_frame') {
      for (const plot of result.data) {
        if (plot.format === 'XY') {
          if (typeof plot.x[0] === 'string') {
            frame.addField({ name: '', values: plot.x, type: FieldType.time });
          } else {
            frame.addField({ name: '', values: plot.x });
          }

          frame.addField({ name: '', values: plot.y });
        } else if (plot.format === 'INDEX') {
          frame.addField({ name: '', values: plot.y });
        }
      }
    } else if (result.type === 'scalar') {
      frame.addField({ name: '', values: [result.value] });
    }

    return frame;
  }

  private async executeNotebook(notebookPath: string, parameters: any) {
    const response = await getBackendSrv().post(this.url + '/ninbexec/v2/executions', [{ notebookPath, parameters }]);
    return this.handleNotebookExecution(response[0].id);
  }

  private async handleNotebookExecution(id: string): Promise<Execution> {
    const execution: Execution = await getBackendSrv().get(this.url + '/ninbexec/v2/executions/' + id);
    if (execution.status === 'QUEUED' || execution.status === 'IN_PROGRESS') {
      await this.timeout(3000);
      return this.handleNotebookExecution(id);
    } else {
      return execution;
    }
  }

  async queryNotebooks(path: string): Promise<Notebook[]> {
    const filter = `path.Contains("${path}")`;
    const response = await getBackendSrv().post(this.url + '/ninbexec/v2/query-notebooks', { filter });
    if (response.notebooks) {
      const notebooks = response.notebooks as Notebook[];
      return notebooks.filter(notebook => notebook.metadata.version === 2);
    } else {
      // TODO: Bubble up error AB#1108330
      return [];
    }
  }

  async testDatasource() {
    return getBackendSrv()
      .get(this.url + '/ninbexec')
      .then(() => ({ status: 'success', message: 'Success' }))
      .catch(error => {
        error.isHandled = true;
        return { status: 'error', message: 'Error' };
      });
  }

  private timeout(ms: number) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }
}
