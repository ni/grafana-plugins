export interface PanelOptions {
  xAxis: AxisOptions;
  yAxis: AxisOptions;
  yAxis2?: AxisOptions;
  showYAxis2: boolean;
  showLegend: boolean;
  series: SeriesOptions;
  series2: SeriesOptions;
}

export interface AxisOptions {
  field: string;
  title?: string;
  min?: number;
  max?: number;
  decimals?: number;
  unit?: string;
  scale?: string;
}

export interface SeriesOptions {
  plotType: string;
  stackBars: boolean;
  areaFill: boolean;
  staircase: boolean;
  markerSize: number;
  lineWidth: number;
}
