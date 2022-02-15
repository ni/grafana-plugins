import defaults from 'lodash/defaults';
import { forIn } from 'lodash';

import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { QueryEditorProps, SelectableValue } from '@grafana/data';
import { DataSource } from './datasource';
import { defaultQuery, OutlierDetectionServerOptions, FilterWafersQuery, RequestType as RequestType } from './types';

const { FormField, Select } = LegacyForms;

type Props = QueryEditorProps<DataSource, FilterWafersQuery, OutlierDetectionServerOptions>;

export class QueryEditor extends PureComponent<Props> {
  
  onCheckChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, [event.target.name]: event.target.checked});
    onRunQuery();
  };

  onValueChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, [event.target.name]: event.target.value });
    onRunQuery();
  };

  onRequestTypeChange = (event: SelectableValue<any>) => {
    const { onChange, query, onRunQuery } = this.props;
    onChange({ ...query, requestType: event.value});
    onRunQuery();
  };

  render() {
    const query = defaults(this.props.query, defaultQuery);
    const { requestType: selectedOperation } = query;
    
    const selectValues: SelectableValue[] = [];
    forIn(RequestType, (value, key) => {selectValues.push({value: value, label: value})});
    const selectedOperationValue: SelectableValue<RequestType> = {value: selectedOperation, label: selectedOperation};

    return (
      <div className="gf-form">
         <Select
            value={selectedOperationValue}
            options={selectValues}
            onChange={this.onRequestTypeChange}
          />
          {this.renderForm(selectedOperation, query)}
      </div>
    );
  }

  renderForm(selectedOperation: RequestType, query: FilterWafersQuery): JSX.Element {
    switch(selectedOperation){
      case RequestType.GetWafersList: return this.getWaferListForm(query);
      case RequestType.GetWafer: return this.getWaferFrom(query);
      case RequestType.GetDice: return this.getDiceForm(query);
      default: return (<></>);
    }
  }

  getDiceForm(query: FilterWafersQuery): JSX.Element {
    const { waferDiceId, filterOutGoodDice } = query;
    return (
      <div>
          <FormField
            labelWidth={8}
            value={waferDiceId || ''}
            name="waferDiceId"
            onChange={this.onValueChange}
            label="Wafer Id"
          />
          <FormField
            labelWidth={8}
            type="checkbox"
            name='filterOutGoodDice'
            defaultChecked={false}
            checked={filterOutGoodDice}
            onChange={this.onCheckChange}
            label="Filter out good dice"
          />
      </div>
    );
  }

  getWaferFrom(query: FilterWafersQuery): JSX.Element {
    const { waferId } = query;
    return (
      <div>
        <FormField
          labelWidth={8}
          value={waferId || ''}
          name='waferId'
          onChange={this.onValueChange}
          label="Wafer Id"
        />
      </div>
    );
  }

  getWaferListForm(query: FilterWafersQuery): JSX.Element {
    const { product, operation, lot, testProgram } = query;
    return (
      <div>
        <FormField
          labelWidth={8}
          value={product || undefined}
          name="product"
          onChange={this.onValueChange}
          label="Product"
        />
        <FormField
          labelWidth={8}
          value={operation || undefined}
          name="operation"
          onChange={this.onValueChange}
          label="Operation"
        />
        <FormField
          labelWidth={8}
          value={lot || undefined}
          name="lot"
          onChange={this.onValueChange}
          label="Lot"
        />
        <FormField
          labelWidth={8}
          value={testProgram || undefined}
          name="testProgram"
          onChange={this.onValueChange}
          label="TestProgram"
        />
      </div>
    );
  }

}
