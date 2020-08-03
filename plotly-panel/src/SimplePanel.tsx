import React from 'react';
import { PanelProps, getDataFrameRow } from '@grafana/data';
import { SimpleOptions } from 'types';
import { css, cx } from 'emotion';
import { stylesFactory, useTheme } from '@grafana/ui';
import Plot from 'react-plotly.js';

interface Props extends PanelProps<SimpleOptions> {}

export const SimplePanel: React.FC<Props> = ({ options, data, width, height }) => {
  const theme = useTheme();
  const styles = getStyles();
  return (
    <Plot
      data={[
        {
          x: data.series[0].fields[0].values.toArray(),
          y: data.series[0].fields[1].values.toArray()
        }
      ]}
      layout={{
        width,
        height,
        paper_bgcolor: theme.colors.bg1,
        plot_bgcolor: theme.colors.bg1,
        font: { color: theme.colors.text },
        margin: { t: 40, r: 40, b: 40, l: 40}
      }}
    />
  );
};

const getStyles = stylesFactory(() => {
  return {
    wrapper: css`
      position: relative;
    `,
    svg: css`
      position: absolute;
      top: 0;
      left: 0;
    `,
    textBox: css`
      position: absolute;
      bottom: 0;
      left: 0;
      padding: 10px;
    `,
  };
});
