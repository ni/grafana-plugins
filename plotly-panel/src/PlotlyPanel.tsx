import React from 'react';
import { PanelProps, DataFrame, FieldType, Field, GrafanaTheme, getFrameDisplayName } from '@grafana/data';
import { PanelOptions } from 'types';
import { useTheme } from '@grafana/ui';
import Plot from 'react-plotly.js';
import { PlotType } from 'plotly.js';

interface Props extends PanelProps<PanelOptions> {}

export const PlotlyPanel: React.FC<Props> = props => {
  const { data, width, height, options } = props;
  const theme = useTheme();
  const plotData: Plotly.Data[] = [];
  for (const [index, dataframe] of data.series.entries()) {
    const [xField, yField] = getFields(dataframe, props);

    plotData.push({
      x: xField ? getFieldValues(xField) : [],
      y: yField ? getFieldValues(yField) : [],
      name: getFrameDisplayName(dataframe, index),
      type: options.plotType as PlotType,
    });
  }

  return (
    <Plot
      data={plotData}
      layout={{
        width,
        height,
        annotations: plotData.length === 0 ? [{ text: 'No data', showarrow: false }] : [],
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
  let xField = frame.fields.find(field => field.name === props.options.xAxisField);
  if (!xField) {
    xField = frame.fields.find(field => field.type === FieldType.time);
    if (!xField) {
      xField = frame.fields.find(field => field.name !== props.options.yAxisField);
    }
  }

  let yField = frame.fields.find(field => field.name === props.options.yAxisField);
  if (!yField) {
    yField = frame.fields.find(field => field !== xField);
  }

  const xAxisField = xField?.name || '';
  const yAxisField = yField?.name || '';
  if (xAxisField !== props.options.xAxisField || yAxisField !== props.options.yAxisField) {
    props.onOptionsChange({ ...props.options, xAxisField, yAxisField });
  }

  return [xField, yField];
};

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
    xaxis: { fixedrange: true },
    yaxis: { fixedrange: true },
    showlegend: options.showLegend,
    barmode: options.stackBars ? 'stack' : 'group',
  };

  return layout;
};
