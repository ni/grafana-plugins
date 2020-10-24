import { PanelPlugin, FieldOverrideContext, getFieldDisplayName } from '@grafana/data';
import { PanelOptions } from './types';
import { PlotlyPanel } from './PlotlyPanel';

export const plugin = new PanelPlugin<PanelOptions>(PlotlyPanel)
  .setPanelOptions(builder => {
    return builder
      .addSelect({
        path: 'xAxisField',
        name: 'X Axis',
        settings: {
          options: [],
          getOptions: getFieldOptions,
        },
        defaultValue: '',
      })
      .addSelect({
        path: 'yAxisField',
        name: 'Y Axis',
        settings: {
          options: [],
          getOptions: getFieldOptions,
        },
        defaultValue: '',
      })
      .addRadio({
        path: 'plotType',
        name: 'Plot type',
        settings: {
          options: [
            { label: 'Line', value: 'scatter' },
            { label: 'Bar', value: 'bar' },
          ],
        },
        defaultValue: 'scatter',
      })
      .addBooleanSwitch({
        path: 'stackBars',
        name: 'Stack bars',
        defaultValue: false,
        showIf: options => options.plotType === 'bar',
      })
      .addBooleanSwitch({
        path: 'showLegend',
        name: 'Show legend',
        defaultValue: false,
      });
  })
  .useFieldConfig();

const getFieldOptions = (context: FieldOverrideContext) => {
  const options = [];
  if (context && context.data) {
    for (const frame of context.data) {
      for (const field of frame.fields) {
        // TODO: this uses dataframe names instead of field names and is confusing
        const label = getFieldDisplayName(field, frame, context.data);
        options.push({ value: field.name, label });
      }
    }
  }
  return options;
};
