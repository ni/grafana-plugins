import React from 'react';
import {
  PanelProps,
  DataFrame,
  FieldType,
  Field,
  GrafanaTheme,
  getFieldDisplayName,
  getColorForTheme,
  Color,
  getColorDefinitionByName
} from '@grafana/data';
import { PanelOptions } from 'types';
import { useTheme } from '@grafana/ui';
import Plot from 'react-plotly.js';
import { PlotType } from 'plotly.js';

interface Props extends PanelProps<PanelOptions> {}

export const PlotlyPanel: React.FC<Props> = props => {
  const { data, width, height, options } = props;
  const theme = useTheme();
  const plotData: Plotly.Data[] = [];
  for (const dataframe of data.series) {
    const [xField, yField, yField2] = getFields(dataframe, props);
    const { mode, type } = getModeAndType(options.series.plotType);

    plotData.push({
      x: xField ? getFieldValues(xField) : [],
      y: yField ? getFieldValues(yField) : [],
      name: getFieldDisplayName(yField as Field, dataframe, data.series),
      mode: mode as any,
      type: type as PlotType,
      fill: options.series.areaFill && options.series.plotType === 'line' ? 'tozeroy' : 'none',
      marker: {
        size: options.series.markerSize,
        color: getPlotlyColor(yField?.config.custom?.color),
      },
      line: {
        width: options.series.lineWidth,
        shape: options.series.staircase ? 'hv' : 'linear',
      },
    });

    if (yField2 && props.options.showYAxis2) {
      const { mode, type } = getModeAndType(options.series2.plotType);
      plotData.push({
        x: xField ? getFieldValues(xField) : [],
        y: yField2 ? getFieldValues(yField2) : [],
        yaxis: 'y2',
        name: getFieldDisplayName(yField2 as Field, dataframe, data.series),
        mode: mode as any,
        type: type as PlotType,
        fill: options.series2.areaFill && options.series2.plotType === 'line' ? 'tozeroy' : 'none',
        marker: {
          size: options.series2.markerSize,
          color: getPlotlyColor(yField2?.config.custom?.color),
        },
        line: {
          width: options.series2.lineWidth,
          shape: options.series2.staircase ? 'hv' : 'linear',
        },
      });
    }
  }

  return (
    <Plot
      data={plotData}
      layout={{
        width,
        height,
        annotations: plotData.length === 0 || !plotData.find(d => d.y?.length) ? [{ text: 'No data', showarrow: false }] : [],
        ...getLayout(theme, options),
      }}
      config={{ displayModeBar: false }}
    />
  );
};

// Pull out user-selected fields from a DataFrame.
// If the options aren't set or the fields don't exist, try to pick the first
// available fields, prioritizing time fields on the X axis.
const getFields = (frame: DataFrame, props: Props) => {
  let xField = frame.fields.find(field => field.name === props.options.xAxis.field);
  if (!xField) {
    xField = frame.fields.find(field => field.type === FieldType.time);
    if (!xField) {
      xField = frame.fields.find(field => field.name !== props.options.yAxis.field);
    }
  }

  let yField = frame.fields.find(field => field.name === props.options.yAxis.field);
  if (!yField) {
    yField = frame.fields.find(field => field !== xField && field.type !== FieldType.time);
  }

  let yField2 = frame.fields.find(field => field.name === props.options.yAxis2?.field);

  const xAxisField = xField?.name || '';
  const yAxisField = yField?.name || '';
  const yAxisField2 = yField2?.name || '';
  if (xAxisField !== props.options.xAxis.field || yAxisField !== props.options.yAxis.field) {
    props.onOptionsChange({
      ...props.options,
      xAxis: { ...props.options.xAxis, field: xAxisField },
      yAxis: { ...props.options.yAxis, field: yAxisField },
      yAxis2: { ...props.options.yAxis2, field: yAxisField2 },
    });
  }

  return [xField, yField, yField2];
};

const getModeAndType = (type: string) => {
  switch (type) {
    case 'line':
      return { mode: 'lines', type: 'scatter' };
    case 'points':
      return { mode: 'markers', type: 'scatter' };
    default:
      return { type: type };
  }
}

const getPlotlyColor = (grafanaColor: string) => {
  if (!grafanaColor) {
    // Let plotly choose
    return;
  }

  if (grafanaColor.startsWith('rgb')) {
    return grafanaColor;
  }

  const colorDefinition = getColorDefinitionByName(grafanaColor as Color);
  return getColorForTheme(colorDefinition);
}

const getFieldValues = (field: Field) => {
  if (field.type === FieldType.time) {
    return field.values.toArray().map(value => {
      return typeof value === 'number' ? new Date(value).toISOString() : value;
    });
  } else {
    return field.values.toArray();
  }
};

const getLayout = (theme: GrafanaTheme, options: PanelOptions) => {
  const layout: Partial<Plotly.Layout> = {
    margin: { r: 40, l: 40, t: 20, b: 40 },
    paper_bgcolor: theme.colors.panelBg,
    plot_bgcolor: theme.colors.panelBg,
    font: { color: theme.colors.text },
    xaxis: {
      fixedrange: true,
      title: options.xAxis.title,
      type: options.xAxis.scale as any,
    },
    yaxis: {
      fixedrange: true,
      automargin: true,
      title: options.yAxis.title,
      range: [options.yAxis.min, options.yAxis.max],
      type: options.yAxis.scale as any,
      tickformat: options.yAxis.decimals ? `.${options.yAxis.decimals}f` : '',
      ticksuffix: options.yAxis.unit ? ` ${options.yAxis.unit}` : '',
    },
    yaxis2: {
      fixedrange: true,
      visible: options.showYAxis2,
      automargin: true,
      overlaying: 'y',
      side: 'right',
      title: options.yAxis2?.title,
      range: [options.yAxis2?.min, options.yAxis2?.max],
      type: options.yAxis2?.scale as any,
      tickformat: options.yAxis2?.decimals ? `.${options.yAxis2?.decimals}f` : '',
      ticksuffix: options.yAxis2?.unit ? ` ${options.yAxis2?.unit}` : '',
    },
    showlegend: options.showLegend,
    legend: {
      x: options.showYAxis2 ? 1.1 : 1,
    },
    barmode: options.series.stackBars ? 'stack' : 'group',
  };

  return layout;
};
