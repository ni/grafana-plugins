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

import { MyQuery, MyDataSourceOptions, defaultQuery } from './types';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
  url?: string;

  constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
    super(instanceSettings);
    this.url = instanceSettings.url;
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    // const aFrame = new ArrayDataFrame([{ cat: 1, dog: 2, bunny: 3 }]);
    // return { data: [aFrame] };

    //const { range } = options;
    //const from = range!.from.valueOf();
    //const to = range!.to.valueOf();
    // Assume one target for now
    const target = options.targets[0];
    const query = defaults(target, defaultQuery);

    if (!query.path) {
      return { data: [] };
    }

    const execution = await this.executeNotebook(query.path, query.parameters);
    if (execution.status === 'SUCCEEDED') {
      // TODO: user picks output
      const result = execution.result.result[0];
      //const config = result.config.graph;
      // const xField = config.axis_labels[0] || 'x',
      //   yField = config.axis_labels[1] || 'y';

      const frame = new MutableDataFrame({
        refId: query.refId,
        fields: [],
      });

      for (const plot of result.data) {
        if (plot.format === 'XY') {
          if (typeof plot.x[0] === 'string') {
            frame.addField({ name: '', values: plot.x, type: FieldType.time });
          } else {
            frame.addField({ name: '', values: plot.x });
          }
          //const color = { fixedColor: 'rgb(255, 0, 0)', mode: FieldColorMode.Fixed };
          frame.addField({ name: '', values: plot.y });
        }
      }

      return { data: [frame] };
    } else {
      // TODO: handle failure
      return { data: [] };
    }
  }

  async executeNotebook(notebookPath: string, parameters: any) {
    return getBackendSrv()
      .post(this.url + '/ninbexec/v2/executions', [{ notebookPath, parameters }])
      .then(response => this.handleNotebookExecution(response[0].id));
  }

  async handleNotebookExecution(id: string): Promise<any> {
    const execution = await getBackendSrv().get(this.url + '/ninbexec/v2/executions/' + id);
    if (execution.status === 'QUEUED' || execution.status === 'IN_PROGRESS') {
      await this.timeout(3000);
      return this.handleNotebookExecution(id);
    } else {
      return execution;
    }
  }

  async queryNotebooks(path: string) {
    const filter = `path.Contains("${path}")`;
    return getBackendSrv().post(this.url + '/ninbexec/v2/query-notebooks', { filter });
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

  async timeout(ms: number) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    });
  }
}
