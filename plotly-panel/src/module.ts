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
            { label: 'Line', value: 'line' },
            { label: 'Bar', value: 'bar' },
            { label: 'Points', value: 'points' },
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
        path: 'areaFill',
        name: 'Area fill',
        defaultValue: false,
        showIf: options => options.plotType === 'line',
      })
      .addBooleanSwitch({
        path: 'staircase',
        name: 'Staircase',
        defaultValue: false,
        showIf: options => options.plotType === 'line',
      })
      .addNumberInput({
        path: 'lineWidth',
        name: 'Line width',
        defaultValue: 2,
        showIf: options => options.plotType === 'line',
      })
      .addNumberInput({
        path: 'markerSize',
        name: 'Point size',
        defaultValue: 6,
        showIf: options => options.plotType === 'points',
      })
      .addBooleanSwitch({
        path: 'showLegend',
        name: 'Show legend',
        defaultValue: false,
      });
  })
  .useFieldConfig({
    useCustomConfig: builder => {
      builder
        .addColorPicker({
          path: 'color',
          name: 'Color',
          description: 'Color of the series',
          settings: {
            enableNamedColors: false,
          },
        });
    },
  });

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
