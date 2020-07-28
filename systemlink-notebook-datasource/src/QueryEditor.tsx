import defaults from 'lodash/defaults';

import React, { PureComponent } from 'react';
import { Field, AsyncSelect, Input } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './DataSource';
import { defaultQuery, MyDataSourceOptions, MyQuery } from './types';

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions>;

export class QueryEditor extends PureComponent<Props, { parameters: any }> {
  constructor(props) {
    super(props);
    this.state = { parameters: [] };
  }

  componentDidMount() {
    // set notebook
  }

  getNotebooks = async (query: string) => {
    const response = await this.props.datasource.queryNotebooks(query);
    return response.notebooks.map(notebook => ({ label: notebook.path, value: notebook }));
  };

  onNotebookChange = (option: SelectableValue) => {
    const notebook = option.value;
    this.setState({ parameters: notebook.metadata.parameters });
    const { onChange, onRunQuery, query } = this.props;
    onChange({ ...query, path: notebook.path });
    onRunQuery();
  };

  onParameterChange = (event: React.FocusEvent) => {
    const { onChange, onRunQuery, query } = this.props;
    const parameters = query.parameters;
    const target = event.target as HTMLInputElement;
    parameters[target.id] = this.formatParameterValue(target.id, target.value);
    // TODO: what does this do? re: nested objects
    onChange({ ...query, parameters });
    onRunQuery();
  }

  formatParameterValue (id: string, value: string) {
    const param = this.state.parameters.find(param => param.id === id);
    if (!param) return value;

    switch (param.type) {
      case 'number': return Number(value);
      default: return value;
    }
  }

  getParameter = (param: any) => {
    if (param.options) {
      //enum
      return null;
    } else {
      return (
        <Field key={param.id} horizontal label={param.display_name}>
          <Input
            id={param.id}
            onBlur={this.onParameterChange}
            type={param.type === 'number' ? 'number' : 'text'}
          />
        </Field>
      )
    }
  }

  render() {
    const query = defaults(this.props.query, defaultQuery);
    return (
      <div>
        <div className="gf-form-inline flex-grow-1">
          <Field label="Notebook">
            <AsyncSelect
              defaultOptions
              onChange={this.onNotebookChange}
              menuPlacement="bottom"
              maxMenuHeight={110}
              loadOptions={this.getNotebooks}
              placeholder="Select notebook"
              width={40}
            />
          </Field>
        </div>
        <div className="gf-form-inline">
          {this.state.parameters.map(this.getParameter)}
        </div>
      </div>
    );
  }
}
