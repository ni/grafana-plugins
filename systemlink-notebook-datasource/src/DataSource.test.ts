import { DataSource } from './DataSource';
import { NotebookDataSourceOptions, NotebookQuery } from './types';

import { DataSourceInstanceSettings, DataQueryRequest } from '@grafana/data';

const postMock = jest.fn((url, body) => mockQueryNotebooksResponse());
const replaceMock = jest.fn((a: string, ...rest: any) => a);

const successfulNotebookPath = '0';
const failedNotebookPath = '1';
const invalidNotebookPath = '2';

jest.mock('@grafana/runtime', () => ({
  // @ts-ignore
  ...jest.requireActual('@grafana/runtime'),
  getBackendSrv: () => ({
    datasourceRequest: jest.fn(options => mockNotebookApiResponse(options)),
    post: postMock,
  }),
  getTemplateSrv: () => ({
    replace: replaceMock,
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Notebook data source', () => {
  let ds: DataSource;
  const instanceSettings = ({
    url: 'http://test',
  } as unknown) as DataSourceInstanceSettings<NotebookDataSourceOptions>;

  beforeEach(() => {
    ds = new DataSource(instanceSettings);
  });

  describe('transformResultToDataFrames', () => {
    it('transforms xy data', () => {
      let query = {
        refId: '123',
        path: '/test/notebook',
        parameters: null,
        output: 'test_output',
      };
      let dataFrame = {
        type: 'data_frame',
        id: 'horizontal_graph',
        data: [{ format: 'XY', x: [0, 1, 2, 3], y: [950, 412, 1390, 1009] }],
        config: {
          title: 'Horizontal Bar Chart',
          graph: {
            axis_labels: ['Labels', 'Values'],
            tick_labels: [
              { x: 0, label: 'label 1' },
              { x: 1, label: 'label 2' },
              { x: 2, label: 'label 3' },
              { x: 3, label: 'label 4' },
            ],
            orientation: 'HORIZONTAL',
            plot_style: ['BAR'],
            plot_labels: ['plot1'],
          },
        },
      };

      let [result] = ds.transformResultToDataFrames(dataFrame, query);

      expect(result.name).toBe('plot1');
      expect(result.fields).toHaveLength(2);
      expect(result.length).toBe(4);
      expect(result.get(0)).toHaveProperty('Field 2', 950);
    });

    it('transforms index data', () => {
      let query = {
        refId: '123',
        path: '/test/notebook',
        parameters: null,
        output: 'test_output',
      };
      let dataFrame = {
        type: 'data_frame',
        id: 'horizontal_graph',
        data: [{ format: 'INDEX', y: [950, 412, 1390, 1009] }],
        config: {
          title: 'Horizontal Bar Chart',
          graph: {
            axis_labels: ['Labels', 'Values'],
            tick_labels: [
              { x: 0, label: 'label 1' },
              { x: 1, label: 'label 2' },
              { x: 2, label: 'label 3' },
              { x: 3, label: 'label 4' },
            ],
            orientation: 'HORIZONTAL',
            plot_style: ['BAR'],
            plot_labels: ['plot1'],
          },
        },
      };

      let [result] = ds.transformResultToDataFrames(dataFrame, query);

      expect(result.name).toBe('plot1');
      expect(result.fields).toHaveLength(2);
      expect(result.length).toBe(4);
      expect(result.get(0)).toEqual({ 'Field 2': 950, 'Index': 0 });
    });

    it('transforms scalar data', () => {
      let query = {
        refId: '123',
        path: '/test/notebook',
        parameters: null,
        output: 'test_output',
      };
      let dataFrame = { type: 'scalar', id: 'output1', value: 2.5 };

      let [result] = ds.transformResultToDataFrames(dataFrame, query);

      expect(result.fields).toHaveLength(1);
      expect(result.length).toBe(1);
      expect(Object.values(result.get(0))).toEqual([2.5]);
    });
  });

  describe('replaceParameterVariables', () => {
    it('attempts to replace variables in string parameters', () => {
      const s1 = 'startedAt > "${__from:date}" && startedAt < "${__to:date}" && partNumber == "$partNumber"';
      const s2 = '$system';
      const parameters = {
        string_param: s1,
        another_string_param: s2,
        number_param: 1,
        object_param: { a: 1 },
      };
      const options = ({
        scopedVars: {},
      } as unknown) as DataQueryRequest<NotebookQuery>;

      ds.replaceParameterVariables(parameters, options);

      expect(replaceMock).toBeCalledTimes(2);
      expect(replaceMock).toBeCalledWith(s1, expect.anything());
      expect(replaceMock).toBeCalledWith(s2, expect.anything());
    });

    it('does not attempt to replace variables in non-string parameters', () => {
      const parameters = {
        number_param: 1,
        object_param: { a: 1 },
      };
      const options = ({
        scopedVars: {},
      } as unknown) as DataQueryRequest<NotebookQuery>;

      ds.replaceParameterVariables(parameters, options);

      expect(replaceMock).not.toBeCalled();
    });
  });

  describe('query', () => {
    it('returns no data for no query', async () => {
      const options = ({ targets: [{}] } as unknown) as DataQueryRequest<NotebookQuery>;

      let result = await ds.query(options);

      expect(result.data.length).toBe(0);
    });

    it('returns frame for successful notebook execution', async () => {
      const options = ({
        targets: [
          {
            path: successfulNotebookPath,
            parameters: [],
            output: 'test',
          },
        ],
      } as unknown) as DataQueryRequest<NotebookQuery>;

      let result = await ds.query(options);

      expect(result.data).toHaveLength(1);
      let frame = result.data[0];
      expect(frame.fields).toHaveLength(1);
      expect(frame.length).toBe(1);
      expect(Object.values(frame.get(0))).toEqual([1]);
    });

    it('throws error for failed notebook execution', async () => {
      const options = ({
        targets: [
          {
            path: failedNotebookPath,
            parameters: [],
            output: 'test',
          },
        ],
      } as unknown) as DataQueryRequest<NotebookQuery>;

      expect(ds.query(options)).rejects.toThrow();
    });

    it('throws error for notebook execution with invalid output', async () => {
      const options = ({
        targets: [{
          path: invalidNotebookPath,
          parameters: [],
          output: 'test'
        }]
      } as unknown) as DataQueryRequest<NotebookQuery>;

      expect(ds.query(options)).rejects.toThrow();
    });
  });

  describe('queryNotebooks', () => {
    it('only returns v2 notebook', async () => {
      const path = '';

      let result = await ds.queryNotebooks(path);

      expect(result).toHaveLength(1);
      expect(result[0].path).toBe('good');
    });

    it('includes path in query', async () => {
      const path = 'testPath';

      await ds.queryNotebooks(path);

      expect(postMock).toBeCalledWith(
        expect.any(String),
        expect.objectContaining({ filter: expect.stringContaining(path) })
      );
    });
  });
});

// @ts-ignore
function mockNotebookApiResponse(options: any) {
  switch (options.url) {
    case 'http://test/ninbexec/v2/executions':
      return {
        data: [
          {
            id: options.data && options.data.length && options.data[0].notebookPath,
          },
        ],
      };
    case `http://test/ninbexec/v2/executions/${successfulNotebookPath}`:
      return {
        data: {
          status: 'SUCCEEDED',
          result: {
            result: [
              {
                id: 'test',
                type: 'scalar',
                value: 1,
              },
            ],
          },
        },
      };
    case `http://test/ninbexec/v2/executions/${failedNotebookPath}`:
      return {
        data: {
          status: 'FAILED',
          exception: 'a python exception',
        },
      };
    case `http://test/ninbexec/v2/executions/${invalidNotebookPath}`:
      return {
        data: {
          status: 'SUCCEEDED',
          result: {
            result: [
              {
                id: 'test',
                type: 'data_frame',
                data: {
                  values: [1, 2, 3]
                }
              }
            ]
          }
        }
      };
    default:
      return {};
  }
}

function mockQueryNotebooksResponse() {
  return {
    notebooks: [
      { path: 'bad', metadata: { version: 1 } },
      { path: 'good', metadata: { version: 2 } },
      { path: 'also bad', metadata: { version: 3 } },
    ],
  };
}
