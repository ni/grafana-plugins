import { PanelPlugin, FieldOverrideContext, getFieldDisplayName } from '@grafana/data';
import { PanelOptions } from './types';
import { PlotlyPanel } from './PlotlyPanel';

export const plugin = new PanelPlugin<PanelOptions>(PlotlyPanel)
  .setPanelOptions(builder => {
    return builder
      .addSelect({
        path: 'xAxis.field',
        name: 'Field',
        settings: {
          options: [],
          getOptions: getFieldOptions,
        },
        defaultValue: '',
        category: ['X Axis'],
      })
      .addTextInput({
        path: 'xAxis.title',
        name: 'Label',
        defaultValue: 'X Axis',
        category: ['X Axis'],
      })
      .addSelect({
        path: 'xAxis.scale',
        name: 'Scale',
        settings: {
          options: [],
          getOptions: getScaleOptions,
        },
        defaultValue: '',
        category: ['X Axis'],
      })
      .addSelect({
        path: 'yAxis.field',
        name: 'Field',
        settings: {
          options: [],
          getOptions: getFieldOptions,
        },
        defaultValue: '',
        category: ['Y Axis'],
      })
      .addTextInput({
        path: 'yAxis.title',
        name: 'Label',
        defaultValue: 'Y Axis',
        category: ['Y Axis'],
      })
      .addSelect({
        path: 'yAxis.scale',
        name: 'Scale',
        settings: {
          options: [],
          getOptions: getScaleOptions,
        },
        defaultValue: '',
        category: ['Y Axis'],
      })
      .addNumberInput({
        path: 'yAxis.min',
        name: 'Min',
        settings: {
          placeholder: 'auto',
        },
        category: ['Y Axis'],
      })
      .addNumberInput({
        path: 'yAxis.max',
        name: 'Max',
        settings: {
          placeholder: 'auto',
        },
        category: ['Y Axis'],
      })
      .addNumberInput({
        path: 'yAxis.decimals',
        name: 'Decimals',
        settings: {
          placeholder: 'auto',
          min: 0,
        },
        category: ['Y Axis'],
      })
      .addTextInput({
        path: 'yAxis.unit',
        name: 'Unit',
        defaultValue: '',
        category: ['Y Axis'],
      })
      .addRadio({
        path: 'series.plotType',
        name: 'Plot type',
        settings: {
          options: [
            { label: 'Line', value: 'line' },
            { label: 'Bar', value: 'bar' },
            { label: 'Points', value: 'points' },
          ],
        },
        defaultValue: 'line',
        category: ['Y Axis'],
      })
      .addBooleanSwitch({
        path: 'series.stackBars',
        name: 'Stack bars',
        defaultValue: false,
        showIf: options => options.series.plotType === 'bar',
        category: ['Y Axis'],
      })
      .addBooleanSwitch({
        path: 'series.areaFill',
        name: 'Area fill',
        defaultValue: false,
        showIf: options => options.series.plotType === 'line',
        category: ['Y Axis'],
      })
      .addBooleanSwitch({
        path: 'series.staircase',
        name: 'Staircase',
        defaultValue: false,
        showIf: options => options.series.plotType === 'line',
        category: ['Y Axis'],
      })
      .addNumberInput({
        path: 'series.lineWidth',
        name: 'Line width',
        defaultValue: 2,
        settings: {
          min: 1,
        },
        showIf: options => options.series.plotType === 'line',
        category: ['Y Axis'],
      })
      .addNumberInput({
        path: 'series.markerSize',
        name: 'Point size',
        defaultValue: 6,
        settings: {
          min: 1,
        },
        showIf: options => options.series.plotType === 'points',
        category: ['Y Axis'],
      })
      .addBooleanSwitch({
        path: 'showYAxis2',
        name: 'Show',
        defaultValue: false,
        category: ['Secondary Y Axis'],
      })
      .addSelect({
        path: 'yAxis2.field',
        name: 'Field',
        settings: {
          options: [],
          getOptions: getFieldOptions,
        },
        defaultValue: '',
        category: ['Secondary Y Axis'],
      })
      .addTextInput({
        path: 'yAxis2.title',
        name: 'Label',
        defaultValue: 'Secondary Y Axis',
        category: ['Secondary Y Axis'],
      })
      .addSelect({
        path: 'yAxis2.scale',
        name: 'Scale',
        settings: {
          options: [],
          getOptions: getScaleOptions,
        },
        defaultValue: '',
        category: ['Secondary Y Axis'],
      })
      .addNumberInput({
        path: 'yAxis2.min',
        name: 'Min',
        settings: {
          placeholder: 'auto',
        },
        category: ['Secondary Y Axis'],
      })
      .addNumberInput({
        path: 'yAxis2.max',
        name: 'Max',
        settings: {
          placeholder: 'auto',
        },
        category: ['Secondary Y Axis'],
      })
      .addNumberInput({
        path: 'yAxis2.decimals',
        name: 'Decimals',
        settings: {
          placeholder: 'auto',
          min: 0,
        },
        category: ['Secondary Y Axis'],
      })
      .addTextInput({
        path: 'yAxis2.unit',
        name: 'Unit',
        defaultValue: '',
        category: ['Secondary Y Axis'],
      })
      .addRadio({
        path: 'series2.plotType',
        name: 'Plot type',
        settings: {
          options: [
            { label: 'Line', value: 'line' },
            { label: 'Bar', value: 'bar' },
            { label: 'Points', value: 'points' },
          ],
        },
        defaultValue: 'line',
        category: ['Secondary Y Axis'],
      })
      .addBooleanSwitch({
        path: 'series2.stackBars',
        name: 'Stack bars',
        defaultValue: false,
        showIf: options => options.series2.plotType === 'bar',
        category: ['Secondary Y Axis'],
      })
      .addBooleanSwitch({
        path: 'series2.areaFill',
        name: 'Area fill',
        defaultValue: false,
        showIf: options => options.series2.plotType === 'line',
        category: ['Secondary Y Axis'],
      })
      .addBooleanSwitch({
        path: 'series2.staircase',
        name: 'Staircase',
        defaultValue: false,
        showIf: options => options.series2.plotType === 'line',
        category: ['Secondary Y Axis'],
      })
      .addNumberInput({
        path: 'series2.lineWidth',
        name: 'Line width',
        defaultValue: 2,
        settings: {
          min: 1,
        },
        showIf: options => options.series2.plotType === 'line',
        category: ['Secondary Y Axis'],
      })
      .addNumberInput({
        path: 'series2.markerSize',
        name: 'Point size',
        defaultValue: 6,
        settings: {
          min: 1,
        },
        category: ['Secondary Y Axis'],
        showIf: options => options.series2.plotType === 'points',
      })
      .addBooleanSwitch({
        path: 'showLegend',
        name: 'Show legend',
        defaultValue: false,
      })
      .addRadio({
        path: 'legendPosition',
        name: 'Legend position',
        settings: {
          options: [
            { label: 'Right', value: 'right' },
            { label: 'Bottom', value: 'bottom' },
          ],
        },
        defaultValue: 'right',
      })
      .addRadio({
        path: 'orientation',
        name: 'Orientation',
        settings: {
          options: [
            { label: 'Vertical', value: 'vertical' },
            { label: 'Horizontal', value: 'horizontal' },
          ],
        },
        defaultValue: 'vertical',
      });
  })
  .useFieldConfig({
    useCustomConfig: builder => {
      builder.addColorPicker({
        path: 'color',
        name: 'Color',
        description: 'Color of the series',
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

const getScaleOptions = (context: FieldOverrideContext) => {
  return [
    { value: '', label: 'Auto' },
    { value: 'linear', label: 'Linear' },
    { value: 'log', label: 'Log' },
  ];
};
