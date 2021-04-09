import { PanelPlugin, FieldOverrideContext, FieldConfigProperty, FieldColorModeId } from '@grafana/data';
import { PanelOptions, FieldOption } from './types';
import { PlotlyPanel } from './PlotlyPanel';
import { MultiSelectValueEditor } from './MultiSelect';

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
        defaultValue: '',
        settings: {
          placeholder: 'auto',
        },
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
      .addNumberInput({
        path: 'xAxis.min',
        name: 'Min',
        settings: {
          placeholder: 'auto',
        },
        category: ['X Axis'],
      })
      .addNumberInput({
        path: 'xAxis.max',
        name: 'Max',
        settings: {
          placeholder: 'auto',
        },
        category: ['X Axis'],
      })
      .addNumberInput({
        path: 'xAxis.decimals',
        name: 'Decimals',
        settings: {
          placeholder: 'auto',
          min: 0,
        },
        category: ['X Axis'],
      })
      .addTextInput({
        path: 'xAxis.unit',
        name: 'Unit',
        defaultValue: '',
        category: ['X Axis'],
      })
      .addCustomEditor({
        path: 'yAxis.fields',
        editor: MultiSelectValueEditor as any,
        settings: {
          options: [],
          getOptions: getFieldOptions,
        },
        name: 'Field',
        id: 'yAxisField',
        defaultValue: [],
        category: ['Y Axis'],
      })
      .addTextInput({
        path: 'yAxis.title',
        name: 'Label',
        defaultValue: '',
        settings: {
          placeholder: 'auto',
        },
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
      .addCustomEditor({
        path: 'yAxis2.fields',
        editor: MultiSelectValueEditor as any,
        settings: {
          options: [],
          getOptions: getFieldOptions,
        },
        name: 'Field',
        id: 'yAxis2Field',
        defaultValue: [],
        showIf: options => options.showYAxis2,
        category: ['Secondary Y Axis'],
      })
      .addTextInput({
        path: 'yAxis2.title',
        name: 'Label',
        defaultValue: '',
        settings: {
          placeholder: 'auto',
        },
        showIf: options => options.showYAxis2,
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
        showIf: options => options.showYAxis2,
        category: ['Secondary Y Axis'],
      })
      .addNumberInput({
        path: 'yAxis2.min',
        name: 'Min',
        settings: {
          placeholder: 'auto',
        },
        showIf: options => options.showYAxis2,
        category: ['Secondary Y Axis'],
      })
      .addNumberInput({
        path: 'yAxis2.max',
        name: 'Max',
        settings: {
          placeholder: 'auto',
        },
        showIf: options => options.showYAxis2,
        category: ['Secondary Y Axis'],
      })
      .addNumberInput({
        path: 'yAxis2.decimals',
        name: 'Decimals',
        settings: {
          placeholder: 'auto',
          min: 0,
        },
        showIf: options => options.showYAxis2,
        category: ['Secondary Y Axis'],
      })
      .addTextInput({
        path: 'yAxis2.unit',
        name: 'Unit',
        defaultValue: '',
        showIf: options => options.showYAxis2,
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
        showIf: options => options.showYAxis2,
        category: ['Secondary Y Axis'],
      })
      .addBooleanSwitch({
        path: 'series2.stackBars',
        name: 'Stack bars',
        defaultValue: false,
        showIf: options => options.showYAxis2 && options.series2.plotType === 'bar',
        category: ['Secondary Y Axis'],
      })
      .addBooleanSwitch({
        path: 'series2.areaFill',
        name: 'Area fill',
        defaultValue: false,
        showIf: options => options.showYAxis2 && options.series2.plotType === 'line',
        category: ['Secondary Y Axis'],
      })
      .addBooleanSwitch({
        path: 'series2.staircase',
        name: 'Staircase',
        defaultValue: false,
        showIf: options => options.showYAxis2 && options.series2.plotType === 'line',
        category: ['Secondary Y Axis'],
      })
      .addNumberInput({
        path: 'series2.lineWidth',
        name: 'Line width',
        defaultValue: 2,
        settings: {
          min: 1,
        },
        showIf: options => options.showYAxis2 && options.series2.plotType === 'line',
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
        showIf: options => options.showYAxis2 && options.series2.plotType === 'points',
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
        path: 'displayVertically',
        name: 'Orientation',
        settings: {
          options: [
            { label: 'Vertical', value: true },
            { label: 'Horizontal', value: false },
          ],
        },
        defaultValue: true,
      })
      .addBooleanSwitch({
        path: 'invertXAxis',
        name: 'Invert X axis',
        defaultValue: true,
        showIf: options => options.displayVertically === false,
      });
  })
  .useFieldConfig({
    standardOptions: {
      [FieldConfigProperty.Color]: {
        settings: {
          byValueSupport: false,
          bySeriesSupport: true,
          preferThresholdsMode: false,
        },
        defaultValue: {
          mode: FieldColorModeId.PaletteClassic,
        },
      },
    },
    disableStandardOptions: [
      FieldConfigProperty.Thresholds,
      FieldConfigProperty.Min,
      FieldConfigProperty.Max,
      FieldConfigProperty.NoValue,
      FieldConfigProperty.Decimals,
      FieldConfigProperty.Mappings
    ]
  });

const getFieldOptions = async (context: FieldOverrideContext) => {
  const options: FieldOption[] = [];
  if (context && context.data) {
    for (const frame of context.data) {
      for (const field of frame.fields) {
        if (!options.find(o => o.label === field.name)) {
          options.push({ value: field.name, label: field.name });
        }
      }
    }
  }
  return options;
};

const getScaleOptions = async (context: FieldOverrideContext) => {
  return [
    { value: '', label: 'Auto' },
    { value: 'linear', label: 'Linear' },
    { value: 'log', label: 'Log' },
  ];
};
