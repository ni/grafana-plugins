import defaults from 'lodash/defaults';

import React, { PureComponent } from 'react';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from './DataSource';
import { defaultQuery, TestMonitorDataSourceOptions, TestMonitorQuery } from './types';

type Props = QueryEditorProps<DataSource, TestMonitorQuery, TestMonitorDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  render() {
    const query = defaults(this.props.query, defaultQuery);
    console.log(query);
    return <div>This doesn't do anything yet. Sorry!</div>;
  }
}
