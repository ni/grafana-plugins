/**
 * QueryEditor is a React component that implements the UI for building a notebook query
 * when editing a Grafana panel.
 */
import defaults from 'lodash/defaults';
import React, { PureComponent } from 'react';
import { Field, Input, Select, Label } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './DataSource';
import { NotebookDataSourceOptions, NotebookQuery, defaultQuery, Notebook } from './types';
import './QueryEditor.scss';

type Props = QueryEditorProps<DataSource, NotebookQuery, NotebookDataSourceOptions>;

export class QueryEditor extends PureComponent<Props, { notebooks: Notebook[]; isLoading: boolean }> {
  constructor(props: Props) {
    super(props);
    this.state = { notebooks: [], isLoading: true };
  }

  async componentDidMount() {
    const notebooks = await this.props.datasource.queryNotebooks('');
    this.setState({ notebooks, isLoading: false });
  }

  getNotebook = (path: string) => {
    return this.state.notebooks.find(notebook => notebook.path === path);
  };

  formatNotebookOption = (notebook: Notebook): SelectableValue => {
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
    const notebook = this.getNotebook(option.value) as Notebook;
    onChange({ ...query, parameters: {}, path: notebook.path, output: notebook.metadata.outputs[0].id });
    onRunQuery();
  };

  onParameterChange = (id: string, value: string) => {
    const { onChange, onRunQuery } = this.props;
    const query = defaults(this.props.query, defaultQuery);
    const parameters = query.parameters;
    parameters[id] = this.formatParameterValue(id, value);
    onChange({ ...query, parameters });
    onRunQuery();
  };

  onOutputChange = (option: SelectableValue) => {
    const { onChange, onRunQuery } = this.props;
    const query = defaults(this.props.query, defaultQuery);
    onChange({ ...query, output: option.value });
    onRunQuery();
  };

  formatParameterValue = (id: string, value: string) => {
    const selectedNotebook = this.getNotebook(this.props.query.path) as Notebook;
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
  };

  getParameter = (param: any) => {
    const query = defaults(this.props.query, defaultQuery);
    const selectedNotebook = this.getNotebook(query.path) as Notebook;
    const value = query.parameters[param.id] || selectedNotebook.parameters[param.id];
    return (
      <div className="sl-parameter" key={param.id}>
        <Label className="sl-parameter-label">{param.display_name}</Label>
        {this.getParameterInput(param, value)}
      </div>
    );
  };

  getParameterInput = (param: any, value: any) => {
    if (param.options) {
      const options = param.options.map((option: string) => ({ label: option, value: option }));
      return (
        <Select
          className="sl-parameter-value"
          options={options}
          onChange={event => this.onParameterChange(param.id, event.value as string)}
          defaultValue={{ label: value, value }}
          menuPlacement="auto"
          maxMenuHeight={110}
        />
      );
    } else {
      return (
        <Input
          className="sl-parameter-value"
          onBlur={event => this.onParameterChange(param.id, event.target.value)}
          type={param.type === 'number' ? 'number' : 'text'}
          defaultValue={value}
        />
      );
    }
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const selectedNotebook = this.getNotebook(query.path);
    return (
      <div className="sl-notebook-query-editor">
        <Field label="Notebook" className="sl-notebook-selector">
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
          <div className="sl-parameters">
            <Label>Parameters</Label>
            {selectedNotebook.metadata.parameters.map(this.getParameter)}
          </div>,
          <Field className="sl-output" label="Output">
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
