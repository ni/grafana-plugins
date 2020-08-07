import defaults from 'lodash/defaults';
import React, { PureComponent } from 'react';
import { Field, Input, Select, Label } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './DataSource';
import { MyDataSourceOptions, NotebookQuery, defaultQuery } from './types';
import './QueryEditor.scss';

type Props = QueryEditorProps<DataSource, NotebookQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props, { notebooks: any[]; isLoading: boolean }> {
  constructor(props: Props) {
    super(props);
    this.state = { notebooks: [], isLoading: true };
  }

  async componentDidMount() {
    const response = await this.props.datasource.queryNotebooks('');
    this.setState({ notebooks: response.notebooks, isLoading: false });
  }

  getNotebook = (path: string) => {
    return this.state.notebooks.find(notebook => notebook.path === path);
  };

  formatNotebookOption = (notebook: any): SelectableValue => {
    const path = notebook.path;
    return {
      label: path.startsWith('_shared') ? path.substring(1) : path.substring(path.indexOf('/')),
      value: path,
    };
  };

  formatOutputOption = (output: any): SelectableValue => {
    return { label: output.display_name, value: output.id };
  };

  onNotebookChange = (option: SelectableValue) => {
    const { onChange, onRunQuery, query } = this.props;
    const notebook = this.getNotebook(option.value);
    onChange({ ...query, parameters: {}, path: notebook.path, output: notebook.metadata.outputs[0].id });
    onRunQuery();
  };

  onParameterChange = (event: React.FocusEvent) => {
    const { onChange, onRunQuery } = this.props;
    const query = defaults(this.props.query, defaultQuery);
    const parameters = query.parameters;
    const target = event.target as HTMLInputElement;
    parameters[target.id] = this.formatParameterValue(target.id, target.value);
    onChange({ ...query, parameters });
    onRunQuery();
  };

  onOutputChange = (option: SelectableValue) => {
    const { onChange, onRunQuery } = this.props;
    const query = defaults(this.props.query, defaultQuery);
    onChange({ ...query, output: option.value });
    onRunQuery();
  };

  formatParameterValue(id: string, value: string) {
    const selectedNotebook = this.getNotebook(this.props.query.path);
    const param = selectedNotebook.metadata.parameters.find((param: any) => param.id === id);
    if (!param) {
      return value;
    }

    switch (param.type) {
      case 'number':
        return Number(value);
      default:
        return value;
    }
  }

  getParameter = (param: any) => {
    const query = defaults(this.props.query, defaultQuery);
    const selectedNotebook = this.getNotebook(query.path);
    const value = query.parameters[param.id] || selectedNotebook.parameters[param.id];
    if (param.options) {
      //TODO: enum parameters
      return null;
    } else {
      return (
        <div className="parameter" key={param.id}>
          <Label className="parameter-label">{param.display_name}</Label>
          <Input
            className="parameter-value"
            id={param.id}
            onBlur={this.onParameterChange}
            type={param.type === 'number' ? 'number' : 'text'}
            defaultValue={value}
          />
        </div>
      );
    }
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const selectedNotebook = this.getNotebook(query.path);
    return (
      <div className="notebook-query-editor">
        <Field label="Notebook" className="notebook-selector">
          <Select
            options={this.state.notebooks.map(this.formatNotebookOption)}
            isLoading={this.state.isLoading}
            onChange={this.onNotebookChange}
            menuPlacement="bottom"
            maxMenuHeight={110}
            placeholder="Select notebook"
            value={selectedNotebook ? this.formatNotebookOption(selectedNotebook) : undefined}
          />
        </Field>
        {selectedNotebook && [
          <div className="parameters">
            <Label>Parameters</Label>
            {selectedNotebook.metadata.parameters.map(this.getParameter)}
          </div>,
          <Field className="output" label="Output">
            <Select
              options={selectedNotebook.metadata.outputs.map(this.formatOutputOption)}
              onChange={this.onOutputChange}
              value={this.formatOutputOption(
                selectedNotebook.metadata.outputs.find((output: any) => output.id === query.output)
              )}
            />
          </Field>,
        ]}
      </div>
    );
  }
}
