import React, { useState } from 'react';
import {
  PanelProps,
  DataFrame,
  FieldType,
  Field,
  GrafanaTheme,
  getFieldDisplayName,
  getColorForTheme,
  Color,
  getColorDefinitionByName,
} from '@grafana/data';
import { PanelOptions } from 'types';
import { useTheme, ContextMenu, ContextMenuGroup, linkModelToContextMenuItems } from '@grafana/ui';
import { getGuid } from 'utils';

import Plot from 'react-plotly.js';
import { AxisType, Legend, PlotData, PlotType } from 'plotly.js';

interface MenuState {
  x: number;
  y: number;
  show: boolean;
  items: ContextMenuGroup[];
}

interface Props extends PanelProps<PanelOptions> {}

export const PlotlyPanel: React.FC<Props> = props => {
  const { data, width, height } = props;
  const originalOptions = props.options;
  const [menu, setMenu] = useState<MenuState>({ x: 0, y: 0, show: false, items: [] });
  const theme = useTheme();
  const plotData: Plotly.Data[] = [];
  const options = transposeAxesIfNecessary(originalOptions);
  for (const dataframe of data.series) {
    setDataFrameId(dataframe);
    const [xField, xField2, yField, yField2] = getFields(dataframe, props, options);

    plotData.push({
      x: xField ? getFieldValues(xField) : [],
      y: yField ? getFieldValues(yField) : [],
      name: getFieldDisplayName(yField as Field, dataframe, data.series),
      ...getModeAndType(options.series.plotType),
      fill: options.series.areaFill && options.series.plotType === 'line' ? 'tozeroy' : 'none',
      marker: {
        size: options.series.markerSize,
        color: getPlotlyColor(yField?.config.custom?.color),
      },
      line: {
        width: options.series.lineWidth,
        shape: options.series.staircase ? 'hv' : 'linear',
      },
      orientation: options.orientation === 'horizontal' ? 'h' : 'v',
      customdata: [dataframe.meta?.custom?.id],
    });

    if (yField2 && props.options.showYAxis2) {
      plotData.push({
        x: xField ? getFieldValues(xField) : [],
        y: yField2 ? getFieldValues(yField2) : [],
        yaxis: 'y2',
        name: getFieldDisplayName(yField2 as Field, dataframe, data.series),
        ...getModeAndType(options.series2.plotType),
        fill: options.series2.areaFill && options.series2.plotType === 'line' ? 'tozeroy' : 'none',
        marker: {
          size: options.series2.markerSize,
          color: getPlotlyColor(yField2?.config.custom?.color),
        },
        line: {
          width: options.series2.lineWidth,
          shape: options.series2.staircase ? 'hv' : 'linear',
        },
        orientation: options.orientation === 'horizontal' ? 'h' : 'v',
        customdata: [dataframe.meta?.custom?.id],
      });
    } else if (xField2 && options.showXAxis2) {
      plotData.push({
        x: xField2 ? getFieldValues(xField2) : [],
        y: yField ? getFieldValues(yField) : [],
        xaxis: 'x2',
        name: getFieldDisplayName(xField2 as Field, dataframe, data.series),
        ...getModeAndType(options.series2.plotType),
        fill: options.series2.areaFill && options.series2.plotType === 'line' ? 'tozeroy' : 'none',
        marker: {
          size: options.series2.markerSize,
          color: getPlotlyColor(xField2?.config.custom?.color),
        },
        line: {
          width: options.series2.lineWidth,
          shape: options.series2.staircase ? 'hv' : 'linear',
        },
        orientation: options.orientation === 'horizontal' ? 'h' : 'v',
        customdata: [dataframe.meta?.custom?.id],
      });
    }
  }

  const handlePlotClick = (plotEvent: Readonly<Plotly.PlotMouseEvent>) => {
    const point = plotEvent.points[0];
    const [id] = point.data.customdata;
    const frame = data.series.find(frame => frame.meta?.custom?.id === id);
    if (!frame) {
      return;
    }

    const field = frame.fields.find(field => point.data.name === getFieldDisplayName(field, frame, data.series));

    if (!field || !field.getLinks) {
      return;
    }

    const links = field.getLinks({ valueRowIndex: point.pointIndex });
    setMenu({
      x: plotEvent.event.x,
      y: plotEvent.event.y,
      show: true,
      items: [{ label: 'Data links', items: linkModelToContextMenuItems(() => links) }],
    });
  };

  return (
    <div>
      <Plot
        data={plotData}
        layout={{
          width,
          height,
          annotations:
            plotData.length === 0 || !plotData.find(d => d.y?.length) ? [{ text: 'No data', showarrow: false }] : [],
          ...getLayout(theme, options),
        }}
        config={{ displayModeBar: false }}
        onClick={handlePlotClick}
      />
      {menu.show && (
        <ContextMenu items={menu.items} x={menu.x} y={menu.y} onClose={() => setMenu({ ...menu, show: false })} />
      )}
    </div>
  );
};

// Fingerprint a dataframe so we can backreference it when a plot is clicked
const setDataFrameId = (frame: DataFrame) => {
  if (frame.meta?.custom?.id) {
    return;
  } else if (frame.meta?.custom) {
    frame.meta.custom['id'] = getGuid();
  } else if (frame.meta) {
    frame.meta.custom = { id: getGuid() };
  } else {
    frame.meta = { custom: { id: getGuid() } };
  }
};

// Pull out user-selected fields from a DataFrame.
// If the options aren't set or the fields don't exist, try to pick the first
// available fields, prioritizing time fields on the X axis.
const getFields = (frame: DataFrame, props: Props, options: PanelOptions) => {
  let xField = frame.fields.find(field => field.name === options.xAxis.field);
  if (!xField) {
    xField = frame.fields.find(field => field.type === FieldType.time);
    if (!xField) {
      xField = frame.fields.find(field => field.name !== options.yAxis.field);
    }
  }
  
  let xField2 = frame.fields.find(field => field.name === options.xAxis2?.field);

  let yField = frame.fields.find(field => field.name === options.yAxis.field);
  if (!yField) {
    yField = frame.fields.find(field => field !== xField && field.type !== FieldType.time);
  }

  let yField2 = frame.fields.find(field => field.name === options.yAxis2?.field);

  const xAxisField = xField?.name || '';
  const xAxisField2 = xField2?.name || '';
  const yAxisField = yField?.name || '';
  const yAxisField2 = yField2?.name || '';
  if (xAxisField !== options.xAxis.field || yAxisField !== options.yAxis.field) {
    //TODO: this is not going to work with my change
    props.onOptionsChange({
      ...props.options,
      xAxis: { ...props.options.xAxis, field: xAxisField },
      xAxis2: { ...props.options.xAxis2, field: xAxisField2 },
      yAxis: { ...props.options.yAxis, field: yAxisField },
      yAxis2: { ...props.options.yAxis2, field: yAxisField2 },
    });
  }

  return [xField, xField2, yField, yField2];
};

const getModeAndType = (type: string) => {
  switch (type) {
    case 'line':
      return { mode: 'lines' as PlotData['mode'], type: 'scatter' as PlotType };
    case 'points':
      return { mode: 'markers' as PlotData['mode'], type: 'scatter' as PlotType };
    default:
      return { type: type as PlotType };
  }
};

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
    xaxis: {
      fixedrange: true,
      title: options.xAxis.title,
      type: options.xAxis.scale as AxisType, //TODO: range and ticks
    },
    xaxis2: {
      fixedrange: true,
      visible: options.showXAxis2,
      automargin: true, // ?
      overlaying: 'x',
      side: 'top',
      title: options.xAxis2?.title,
      range: [options.xAxis2?.min, options.xAxis2?.max],
      type: options.xAxis2?.scale as AxisType,
      tickformat: options.xAxis2?.decimals ? `.${options.xAxis2?.decimals}f` : '',
      ticksuffix: options.xAxis2?.unit ? ` ${options.xAxis2?.unit}` : '',
    },
    yaxis: {
      fixedrange: true,
      automargin: true,
      title: options.yAxis.title,
      range: [options.yAxis.min, options.yAxis.max],
      type: options.yAxis.scale as AxisType,
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
      type: options.yAxis2?.scale as AxisType,
      tickformat: options.yAxis2?.decimals ? `.${options.yAxis2?.decimals}f` : '',
      ticksuffix: options.yAxis2?.unit ? ` ${options.yAxis2?.unit}` : '',
    },
    showlegend: options.showLegend,
    legend: getLegendLayout(options.legendPosition, options.showYAxis2, !!options.xAxis.title),
    barmode: options.series.stackBars ? 'stack' : 'group',
    hovermode: 'closest',
  };

  return layout;
};

const getLegendLayout = (position: string, showYAxis2: boolean, showXAxisLabel: boolean): Partial<Legend> => {
  if (position === 'bottom') {
    return {
      orientation: 'h',
      x: 0,
      xanchor: 'left',
      y: showXAxisLabel ? -0.3 : -0.2,
      yanchor: 'top',
    };
  }
  return {
    orientation: 'v',
    x: showYAxis2 ? 1.1 : 1,
    xanchor: 'left',
    y: 1,
    yanchor: 'top',
  };
};

const transposeAxesIfNecessary = (originalOptions: PanelOptions): PanelOptions => {
  if (originalOptions.orientation === 'vertical') {
    return originalOptions;
  }
  const newOptions: PanelOptions = {
    xAxis: originalOptions.yAxis,
    xAxis2: originalOptions.yAxis2,
    showXAxis2: originalOptions.showYAxis2,
    yAxis: originalOptions.xAxis,
    showYAxis2: false,
    showLegend: originalOptions.showLegend,
    legendPosition: originalOptions.legendPosition,
    orientation: originalOptions.orientation,
    series: originalOptions.series,
    series2: originalOptions.series2,
  };
  return newOptions;
};