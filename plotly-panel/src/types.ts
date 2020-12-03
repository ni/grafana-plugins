export interface PanelOptions {
  xAxis: AxisOptions;
  xAxis2?: AxisOptions;
  showXAxis2: boolean;
  yAxis: AxisOptions;
  yAxis2?: AxisOptions;
  showYAxis2: boolean;
  showLegend: boolean;
  legendPosition: string;
  orientation: string;
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
