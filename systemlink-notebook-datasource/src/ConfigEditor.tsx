import React, { PureComponent } from 'react';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { DataSourceHttpSettings } from '@grafana/ui';
import { MyDataSourceOptions } from './types';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
  render() {
    const { options, onOptionsChange } = this.props;
    //const { jsonData, secureJsonFields } = options;
    //const secureJsonData = (options.secureJsonData || {}) as MySecureJsonData;

    return (
      <DataSourceHttpSettings
        defaultUrl=""
        dataSourceConfig={options}
        showAccessOptions={false}
        onChange={onOptionsChange}
      />
    );
  }
}
