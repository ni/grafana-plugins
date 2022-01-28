import defaults from 'lodash/defaults';

import React, { PureComponent } from 'react';
import { QueryEditorProps } from '@grafana/data';
import { Button, Card, Icon } from '@grafana/ui';
import { DataSource } from './DataSource';
import { defaultQuery, TestMonitorDataSourceOptions, TestMonitorQuery } from './types';

type Props = QueryEditorProps<DataSource, TestMonitorQuery, TestMonitorDataSourceOptions>;

export class QueryEditor extends PureComponent<Props> {
  render() {
    const query = defaults(this.props.query, defaultQuery);
    console.log(query);
    return (
      <Card heading="Alert" description="This datasource is only intended to be used for variable queries.">
        <Card.Figure>
          <Icon name="exclamation-triangle" size="xl" />
        </Card.Figure>
        <Card.Actions>
          <a
            target="_blank"
            rel="noreferrer"
            href="https://grafana.com/docs/grafana/latest/variables/variable-types/add-query-variable/"
          >
            <Button>More info</Button>
          </a>
        </Card.Actions>
      </Card>
    );
  }
}
