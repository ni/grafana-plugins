/**
 * DataSource is a TypeScript class that implements the logic for executing and querying
 * notebooks. The 'query' method is called from Grafana's internals when a panel requests data.
 */
import defaults from 'lodash/defaults';
import range from 'lodash/range';
import Ajv from 'ajv';

import { PolicyEvaluator } from '@ni-kismet/helium-uicomponents/library/policyevaluator';
import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
  MetricFindValue,
  DataQueryResponseData,
} from '@grafana/data';
import { getBackendSrv, getTemplateSrv } from '@grafana/runtime';
import {
  NotebookQuery,
  NotebookDataSourceOptions,
  defaultQuery,
  Notebook,
  Execution,
  NotebookParameterQuery,
} from './types';
import { timeout } from './utils';

import * as schema from './data/schema.json';

export class DataSource extends DataSourceApi<NotebookQuery, NotebookDataSourceOptions> {
  url?: string;
  validate: Ajv.ValidateFunction;

  constructor(instanceSettings: DataSourceInstanceSettings<NotebookDataSourceOptions>) {
    super(instanceSettings);
    this.url = instanceSettings.url;

    let ajv = new Ajv();
    this.validate = ajv.compile(schema);
  }

  async metricFindQuery(query: NotebookParameterQuery, options?: any): Promise<MetricFindValue[]> {
    if (!query.path || !query.parameter) {
      return [];
    }

    const notebooks = await this.queryNotebooks(query.path);
    if (!notebooks || !notebooks.length || !Array.isArray(notebooks[0].metadata.parameters)) {
      return [];
    }

    const parameter = notebooks[0].metadata.parameters.find((param: any) => param.id === query.parameter);
    if (!parameter) {
      return [];
    }

    const values = parameter.options || [];
    return values.map((value: string) => ({ text: value }));
  }

  async query(options: DataQueryRequest<NotebookQuery>): Promise<DataQueryResponse> {
    if (!options.targets || !options.targets.length) {
      throw new Error('The SystemLink notebook datasource is not configured properly.');
    }

    let data: DataQueryResponseData[] = [];
    for (const target of options.targets) {
      const query = defaults(target, defaultQuery);

      if (!query.path) {
        continue;
      }

      const parameters = this.replaceParameterVariables(query.parameters, options);
      const execution = await this.executeNotebook(query.path, parameters, query.cacheTimeout);
      if (execution.status === 'SUCCEEDED') {
        if (this.validate(execution.result)) {
          const result = execution.result.result.find((result: any) => result.id === query.output);
          if (!result) {
            throw new Error(`The output of the notebook does not contain an output with id '${query.output}'.`);
          } else {
            const frames = this.transformResultToDataFrames(result, query);
            data = data.concat(frames);
          }
        } else {
          throw new Error('The output for the notebook does not match the expected SystemLink format.');
        }
      } else {
        throw new Error('The notebook failed to execute.');
      }
    }

    return { data };
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
      if (Array.isArray(result.data)) {
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
          }

          frames.push(frame);
        }
      } else {
        // Dataframe table format
        const frame = new MutableDataFrame({ refId: query.refId, fields: [] });
        for (let [ix, column] of result.data.columns.entries()) {
          const values = result.data.values.map((row: any) => row[ix]);
          frame.addField({ name: column.name, type: this.getFieldType(column.type), values });
        }

        frames.push(frame);
      }
    } else if (result.type === 'scalar') {
      const field = { name: result.id, values: [result.value] };
      frames.push(new MutableDataFrame({ refId: query.refId, fields: [field] }));
    }

    return frames;
  }

  private getFieldType(type: string): FieldType {
    if (type === 'string' || type === 'boolean') {
      return FieldType[type];
    } else if (type === 'number' || type === 'integer') {
      return FieldType.number;
    } else if (type === 'datetime') {
      return FieldType.time;
    } else {
      return FieldType.other;
    }
  }

  private async executeNotebook(notebookPath: string, parameters: any, cacheTimeout: number) {
    try {
      const response = await getBackendSrv().datasourceRequest({
        url: this.url + '/ninbexec/v2/executions',
        method: 'POST',
        data: [{ notebookPath, parameters, resultCachePeriod: cacheTimeout }],
      });

      return this.handleNotebookExecution(response.data[0].id);
    } catch (e) {
      throw new Error(`The request to execute the notebook failed with error ${e.status}: ${e.statusText}.`);
    }
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
    const filter = `path.Contains("${path}") && !metadata["namespaces"].Contains("ni-testmanagement-parametric-data-statistics")`;
    try {
      const response = await getBackendSrv().post(this.url + '/ninbexec/v2/query-notebooks', { filter });
      const notebooks = response.notebooks as Notebook[];
      return notebooks.filter((notebook) => notebook.metadata.version === 2);
    } catch (e) {
      throw new Error(`The query for SystemLink notebooks failed with error ${e.status}: ${e.statusText}.`);
    }
  }

  async queryTestResultValues(field: string, startsWith: string): Promise<string[]> {
    const data = { field, startsWith };
    const values = await getBackendSrv().post(this.url + '/nitestmonitor/v2/query-result-values', data);
    // Fiter out values that are '' or null
    return values.slice(0, 20).filter((value: string) => value);
  }

  async testDatasource() {
    try {
      const auth = await getBackendSrv().get(this.url + '/niauth/v1/auth');
      const policyEvaluator = new PolicyEvaluator(auth.policies);
      const actions = ['notebook:Query', 'notebookexecution:Execute', 'notebookexecution:Query'];
      if (actions.every((action) => policyEvaluator.hasAction(action))) {
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
