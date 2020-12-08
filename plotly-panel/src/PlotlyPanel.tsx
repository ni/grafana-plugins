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
import { AxisLabels, PanelOptions } from 'types';
import { useTheme, ContextMenu, ContextMenuGroup, linkModelToContextMenuItems } from '@grafana/ui';
import { getTemplateSrv } from '@grafana/runtime';
import { getGuid } from 'utils';

import Plot from 'react-plotly.js';
import { AxisType, Legend, PlotData, PlotType } from 'plotly.js';
import isEqual from 'lodash/isEqual';
import union from 'lodash/union';

interface MenuState {
  x: number;
  y: number;
  show: boolean;
  items: ContextMenuGroup[];
}

interface Props extends PanelProps<PanelOptions> {}

export const PlotlyPanel: React.FC<Props> = props => {
  const { data, width, height, options } = props;
  const [menu, setMenu] = useState<MenuState>({ x: 0, y: 0, show: false, items: [] });
  const theme = useTheme();
  const plotData: Plotly.Data[] = [];
  const axisLabels: AxisLabels = {
    xAxis: '',
    yAxis: [],
    yAxis2: [],
  };
  for (const dataframe of data.series) {
    setDataFrameId(dataframe);
    const [xField, yFields, yFields2] = getFields(dataframe, props);
    axisLabels.xAxis = (xField as Field).name;

    for (const yField of yFields || []) {
      const yName = getFieldDisplayName(yField as Field, dataframe, data.series);
      const plotlyXAxisField = options.displayVertically ? xField : yField;
      const plotlyYAxisField = options.displayVertically ? yField : xField;
      axisLabels.yAxis = union(axisLabels.yAxis, [(yField as Field).name]);
      plotData.push({
        x: plotlyXAxisField ? getFieldValues(plotlyXAxisField as Field) : [],
        y: plotlyYAxisField ? getFieldValues(plotlyYAxisField as Field) : [],
        name: yName,
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
        orientation: options.displayVertically ? 'v' : 'h',
        customdata: [dataframe.meta?.custom?.id],
      });
    }

    if (yFields2 && props.options.showYAxis2) {
      for (const yField2 of yFields2 || []) {
        const yName = getFieldDisplayName(yField2 as Field, dataframe, data.series);
        const plotlyXAxisField = options.displayVertically ? xField : yField2;
        const plotlyYAxisField = options.displayVertically ? yField2 : xField;
        axisLabels.yAxis2 = union(axisLabels.yAxis2, [(yField2 as Field).name]);
        plotData.push({
          x: plotlyXAxisField ? getFieldValues(plotlyXAxisField as Field) : [],
          y: plotlyYAxisField ? getFieldValues(plotlyYAxisField as Field) : [],
          xaxis: options.displayVertically ? 'x' : 'x2',
          yaxis: options.displayVertically ? 'y2' : 'y',
          name: yName,
          ...getModeAndType(options.series2.plotType),
          fill: options.series2.areaFill && options.series2.plotType === 'line' ? 'tozeroy' : 'none',
          marker: {
            size: options.series2.markerSize,
            color: getPlotlyColor((yField2 as Field)?.config.custom?.color),
          },
          line: {
            width: options.series2.lineWidth,
            shape: options.series2.staircase ? 'hv' : 'linear',
          },
          orientation: options.displayVertically ? 'v' : 'h',
        });
      }
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
          ...getLayout(theme, options, axisLabels),
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
const getFields = (frame: DataFrame, props: Props) => {
  let xField = frame.fields.find(field => field.name === props.options.xAxis.field);
  if (!xField) {
    xField = frame.fields.find(field => field.type === FieldType.time);
    if (!xField) {
      const y = props.options.yAxis.fields || [];
      xField = frame.fields.find(field => !y.includes(field.name));
    }
  }

  let yFields = getYFields(props.options.yAxis.fields, frame, xField);
  let yFields2;
  if (props.options.yAxis2?.fields) {
    yFields2 = getYFields(props.options.yAxis2?.fields, frame, xField, false);
  }

  const xAxisField = xField?.name || '';
  const yAxisFields = yFields.map(yField => yField?.name || '');
  const yAxisFields2 = yFields2?.map(yField => yField?.name || '') || [];
  if (
    xAxisField !== props.options.xAxis.field ||
    !isEqual(yAxisFields, props.options.yAxis.fields) ||
    !isEqual(yAxisFields2, props.options.yAxis2?.fields)
  ) {
    props.onOptionsChange({
      ...props.options,
      xAxis: { ...props.options.xAxis, field: xAxisField },
      yAxis: { ...props.options.yAxis, fields: yAxisFields },
      yAxis2: { ...props.options.yAxis2, fields: yAxisFields2 },
    });
  }

  return [xField, yFields, yFields2];
};

const getYFields = (selection: string[], frame: DataFrame, xField: Field | undefined, autoFill = true) => {
  if (autoFill && (!selection || !selection.length)) {
    let yField = frame.fields.find(field => field !== xField && field.type !== FieldType.time);
    return [yField];
  }

  let yFields: Field[] = [];
  for (const yField of selection || []) {
    let selectedYField = frame.fields.find(field => field.name === yField);
    if (!selectedYField && autoFill) {
      selectedYField = frame.fields.find(
        field => field !== xField && field.type !== FieldType.time && !yFields.includes(field)
      );
    }
    if (selectedYField) {
      yFields.push(selectedYField);
    }
  }
  return yFields;
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

const getLayout = (theme: GrafanaTheme, options: PanelOptions, axisLabels: AxisLabels) => {
  const originalAxisTitleX = getTemplateSrv().replace(options.xAxis.title) || axisLabels.xAxis;
  const originalAxisTitleY = getTemplateSrv().replace(options.yAxis.title) || axisLabels.yAxis.join(', ');
  const xAxisOptions = options.displayVertically ? options.xAxis : options.yAxis;
  const xAxisTitle = options.displayVertically ? originalAxisTitleX : originalAxisTitleY;
  const yAxisOptions = options.displayVertically ? options.yAxis : options.xAxis;
  const yAxisTitle = options.displayVertically ? originalAxisTitleY : originalAxisTitleX;
  const showXAxis2 = options.showYAxis2 && !options.displayVertically;
  const showYAxis2 = options.showYAxis2 && options.displayVertically;
  const layout: Partial<Plotly.Layout> = {
    margin: { r: 40, l: 40, t: 20, b: 40 },
    paper_bgcolor: theme.colors.panelBg,
    plot_bgcolor: theme.colors.panelBg,
    font: { color: theme.colors.text },
    xaxis: {
      fixedrange: true,
      title: xAxisTitle,
      range: [xAxisOptions.min, xAxisOptions.max],
      type: xAxisOptions.scale as AxisType,
      tickformat: xAxisOptions.decimals ? `.${xAxisOptions.decimals}f` : '',
      ticksuffix: xAxisOptions.unit ? ` ${xAxisOptions.unit}` : '',
    },
    xaxis2: {
      fixedrange: true,
      visible: showXAxis2,
      automargin: true,
      overlaying: 'x',
      side: 'top',
      title: getTemplateSrv().replace(options.yAxis2?.title) || axisLabels.yAxis2.join(', '),
      range: [options.yAxis2?.min, options.yAxis2?.max],
      type: options.yAxis2?.scale as AxisType,
      tickformat: options.yAxis2?.decimals ? `.${options.yAxis2?.decimals}f` : '',
      ticksuffix: options.yAxis2?.unit ? ` ${getTemplateSrv().replace(options.yAxis2?.unit)}` : '',
    },
    yaxis: {
      fixedrange: true,
      automargin: true,
      title: yAxisTitle,
      range: [yAxisOptions.min, yAxisOptions.max],
      type: yAxisOptions.scale as AxisType,
      tickformat: yAxisOptions.decimals ? `.${yAxisOptions.decimals}f` : '',
      ticksuffix: yAxisOptions.unit ? ` ${getTemplateSrv().replace(options.yAxis.unit)}` : '',
      autorange: shouldInvertVerticalAxis(options) ? 'reversed' : undefined,
    },
    yaxis2: {
      fixedrange: true,
      visible: showYAxis2,
      automargin: true,
      overlaying: 'y',
      side: 'right',
      title: getTemplateSrv().replace(options.yAxis2?.title) || axisLabels.yAxis2.join(', '),
      range: [options.yAxis2?.min, options.yAxis2?.max],
      type: options.yAxis2?.scale as AxisType,
      tickformat: options.yAxis2?.decimals ? `.${options.yAxis2?.decimals}f` : '',
      ticksuffix: options.yAxis2?.unit ? ` ${getTemplateSrv().replace(options.yAxis2?.unit)}` : '',
    },
    showlegend: options.showLegend,
    legend: getLegendLayout(options.legendPosition, showYAxis2, !!xAxisOptions.title),
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

const shouldInvertVerticalAxis = (options: PanelOptions) => {
  return options.displayVertically === false && options.invertXAxis;
};
