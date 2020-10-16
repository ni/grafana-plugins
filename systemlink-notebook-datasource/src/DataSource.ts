/**
 * DataSource is a TypeScript class that implements the logic for executing and querying
 * notebooks. The 'query' method is called from Grafana's internals when a panel requests data.
 */
import defaults from 'lodash/defaults';
import range from 'lodash/range';
import { PolicyEvaluator } from '@ni-kismet/helium-uicomponents/library/policyevaluator';
import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';
import { getBackendSrv, getTemplateSrv } from '@grafana/runtime';
import { NotebookQuery, NotebookDataSourceOptions, defaultQuery, Notebook, Execution } from './types';
import { timeout } from './utils';

export class DataSource extends DataSourceApi<NotebookQuery, NotebookDataSourceOptions> {
  url?: string;

  constructor(instanceSettings: DataSourceInstanceSettings<NotebookDataSourceOptions>) {
    super(instanceSettings);
    this.url = instanceSettings.url;
  }

  async query(options: DataQueryRequest<NotebookQuery>): Promise<DataQueryResponse> {
    // Assume one target for now, TODO: bubble up error AB#1108330
    const target = options.targets[0];
    const query = defaults(target, defaultQuery);

    if (!query.path) {
      return { data: [] };
    }

    const parameters = this.replaceParameterVariables(query.parameters, options);
    const execution = await this.executeNotebook(query.path, parameters);
    if (execution.status === 'SUCCEEDED') {
      // TODO: Verify result object AB#1108330
      const result = execution.result.result.find((result: any) => result.id === query.output);
      const frames = this.transformResultToDataFrames(result, query);
      return { data: frames };
    } else {
      return { data: [], error: { message: 'The notebook failed to execute.' } };
    }
  }

  replaceParameterVariables(parameters: any, options: DataQueryRequest<NotebookQuery>) {
    return Object.keys(parameters).reduce((result, key) => {
      result[key] =
        typeof parameters[key] === 'string'
          ? getTemplateSrv().replace(parameters[key], options.scopedVars)
          : parameters[key];

      return result;
    }, {} as { [key: string]: any });
  }

  transformResultToDataFrames(result: any, query: NotebookQuery) {
    const frames = [];

    if (result.type === 'data_frame') {
      for (let [ix, dataframe] of result.data.entries()) {
        const frame = new MutableDataFrame({
          refId: query.refId,
          fields: [],
          name: result.config?.graph?.plot_labels?.[ix],
        });

        if (dataframe.format === 'XY') {
          if (typeof dataframe.x[0] === 'string') {
            frame.addField({ name: '', values: dataframe.x, type: FieldType.time });
          } else {
            frame.addField({ name: '', values: dataframe.x });
          }

          frame.addField({ name: '', values: dataframe.y });
        } else if (dataframe.format === 'INDEX') {
          frame.addField({ name: 'Index', values: range(0, dataframe.y.length) });
          frame.addField({ name: '', values: dataframe.y });
        } else if (dataframe.columns) {
          for (let [ix, column] of dataframe.columns.entries()) {
            // New dataframe format
            const values = dataframe.values.map((row: any) => row[ix]);
            frame.addField({ name: column.name, type: this.getFieldType(column.type), values });
          }
        }

        frames.push(frame);
      }
    } else if (result.type === 'scalar') {
      const field = { name: '', values: [result.value] };
      frames.push(new MutableDataFrame({ refId: query.refId, fields: [field] }));
    }

    return frames;
  }

  private getFieldType(type: string): FieldType {
    if (type === 'string' || type === 'number' || type === 'boolean') {
      return FieldType[type];
    } else if (type === 'datetime') {
      return FieldType.time;
    } else {
      return FieldType.other;
    }
  }

  private async executeNotebook(notebookPath: string, parameters: any) {
    const response = await getBackendSrv().datasourceRequest({
      url: this.url + '/ninbexec/v2/executions',
      method: 'POST',
      data: [{ notebookPath, parameters }],
    });

    return this.handleNotebookExecution(response.data[0].id);
  }

  private async handleNotebookExecution(id: string): Promise<Execution> {
    const response = await getBackendSrv().datasourceRequest({
      url: this.url + '/ninbexec/v2/executions/' + id,
      method: 'GET',
    });
    const execution: Execution = response.data;
    if (execution.status === 'QUEUED' || execution.status === 'IN_PROGRESS') {
      await timeout(3000);
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
    try {
      const auth = await getBackendSrv().get(this.url + '/niauth/v1/auth');
      const policyEvaluator = new PolicyEvaluator(auth.policies);
      const actions = ['notebook:Query', 'notebookexecution:Execute', 'notebookexecution:Query'];
      if (actions.every(action => policyEvaluator.hasAction(action))) {
        return { status: 'success', message: 'Success' };
      } else {
        return { status: 'error', message: 'The user is not authorized to query and execute notebooks.' };
      }
    } catch (error) {
      error.isHandled = true;
      return { status: 'error', message: 'The username or password is incorrect.' };
    }
  }
}
