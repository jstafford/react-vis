// Copyright (c) 2016 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {scaleLinear} from 'd3-scale';
import {format} from 'd3-format';

import {AnimationParam, AnimationPropType} from 'animation';
import XYPlot from 'plot/xy-plot';
import {DISCRETE_COLOR_RANGE} from 'theme';
import {
  Margin,
  MarginPropType,
  getInnerDimensions,
  DEFAULT_MARGINS
} from 'utils/chart-utils';
import {getCombinedClassName} from 'utils/styling-utils';
import LineSeries from 'plot/series/line-series';
import LineMarkSeries from 'plot/series/line-mark-series';
import LabelSeries from 'plot/series/label-series';
import DecorativeAxis from 'plot/axis/decorative-axis';
import Highlight from 'plot/highlight';

const predefinedClassName = 'rv-parallel-coordinates-chart';
const DEFAULT_FORMAT = (value: number) =>
  value === 0 ? '0.0' : format('.2r')(value);

interface ParallelDomain {
  domain: number[];
  getValue?: (row: any) => number;
  name: string;
  tickFormat?: (value: number) => string;
}

interface ParallelStyle {
  axes?: {[key: string]: any};
  labels?: React.CSSProperties;
  lines?: React.CSSProperties;
  deselectedLineStyle?: React.CSSProperties;
}

interface BrushFilter {
  min: number;
  max: number;
}

export interface ParallelCoordinatesProps {
  animation?: AnimationParam;
  brushing?: boolean;
  children?: React.ReactNode;
  className?: string;
  colorRange?: string[];
  colorType?: string;
  data: any[];
  domains: ParallelDomain[];
  height: number;
  hideInnerMostValues?: boolean;
  margin?: Margin;
  onMouseEnter?: (event?: React.SyntheticEvent<any>) => void;
  onMouseLeave?: (event?: React.SyntheticEvent<any>) => void;
  showMarks?: boolean;
  style?: ParallelStyle;
  tickFormat?: (value: number) => string;
  width: number;
  [key: string]: any;
}

interface ParallelCoordinatesState {
  brushFilters: {[key: string]: BrushFilter | null};
}

type BrushFilters = {[key: string]: BrushFilter | null};

const DEFAULT_STYLE: ParallelStyle = {
  axes: {
    line: {},
    ticks: {},
    text: {}
  },
  labels: {
    fontSize: 10,
    textAnchor: 'middle'
  },
  lines: {
    strokeWidth: 1,
    strokeOpacity: 1
  },
  deselectedLineStyle: {
    strokeOpacity: 0.1
  }
};

function getAxes(props: ParallelCoordinatesProps): JSX.Element[] {
  const {animation, domains, style = {}, tickFormat = DEFAULT_FORMAT} = props;
  return domains.map((domain, index) => {
    const domainTickFormat = (tick: number) =>
      domain.tickFormat ? domain.tickFormat(tick) : tickFormat(tick);

    return (
      <DecorativeAxis
        animation={animation}
        key={`${index}-axis`}
        axisStart={{x: domain.name, y: 0}}
        axisEnd={{x: domain.name, y: 1}}
        axisDomain={domain.domain}
        numberOfTicks={5}
        tickValue={domainTickFormat}
        style={style.axes}
      />
    );
  });
}

function getLabels(props: {
  domains: ParallelDomain[];
  style?: React.CSSProperties;
}): any[] {
  const {domains, style} = props;
  return domains.map(domain => ({
    x: domain.name,
    y: 1.1,
    label: domain.name,
    style
  }));
}

function getLines(
  props: ParallelCoordinatesProps & ParallelCoordinatesState
): JSX.Element[] {
  const {
    animation,
    brushFilters,
    colorRange = DISCRETE_COLOR_RANGE,
    data,
    domains,
    showMarks,
    style = {}
  } = props;
  const scales = domains.reduce((result: {[key: string]: any}, domain) => {
    result[domain.name] = scaleLinear().domain(domain.domain).range([0, 1]);
    return result;
  }, {});

  return data.map((row, rowIndex) => {
    let withinFilteredRange = true;
    const mappedData = domains.map(domain => {
      const yValue = scales[domain.name](
        domain.getValue ? domain.getValue(row) : row[domain.name]
      );
      const filter = brushFilters[domain.name];
      if (filter && (yValue < filter.min || yValue > filter.max)) {
        withinFilteredRange = false;
      }
      return {x: domain.name, y: yValue};
    });

    const selectedName = `${predefinedClassName}-line`;
    const lineProps: {[key: string]: any} = {
      animation,
      className: withinFilteredRange
        ? selectedName
        : `${selectedName} ${predefinedClassName}-line-unselected`,
      key: `${rowIndex}-polygon`,
      data: mappedData,
      color: row.color || colorRange[rowIndex % colorRange.length],
      style: {...style.lines, ...(row.style || {})}
    };
    if (!withinFilteredRange) {
      lineProps.style = {...lineProps.style, ...style.deselectedLineStyle};
    }

    return showMarks ? (
      <LineMarkSeries {...lineProps} />
    ) : (
      <LineSeries {...lineProps} />
    );
  });
}

const ParallelCoordinates: any = (props: ParallelCoordinatesProps): JSX.Element => {
    const [brushFilters, setBrushFilters] = useState<BrushFilters>({});
    const {
      animation,
      brushing,
      className,
      children,
      colorRange,
      data,
      domains,
      height,
      margin,
      onMouseLeave,
      onMouseEnter,
      showMarks,
      style = DEFAULT_STYLE,
      tickFormat = DEFAULT_FORMAT,
      width
    } = props;

    const axes = getAxes({
      domains,
      animation,
      style,
      tickFormat,
      data,
      height,
      width
    });
    const lines = getLines({
      animation,
      brushFilters,
      colorRange,
      domains,
      data,
      showMarks,
      style,
      height,
      width
    });
    const labelSeries = (
      <LabelSeries
        animation
        key={className}
        className={`${predefinedClassName}-label`}
        data={getLabels({domains, style: style.labels})}
      />
    );

    const {marginLeft, marginRight} = getInnerDimensions(
      props,
      DEFAULT_MARGINS
    );
    return (
      <XYPlot
        height={height}
        width={width}
        margin={margin}
        dontCheckIfEmpty
        className={getCombinedClassName(className, predefinedClassName)}
        onMouseLeave={onMouseLeave}
        onMouseEnter={onMouseEnter}
        xType="ordinal"
        yDomain={[0, 1]}
      >
        {children}
        {axes.concat(lines).concat(labelSeries)}
        {brushing &&
          domains.map(domain => {
            const trigger = (row: any) => {
              setBrushFilters({
                ...brushFilters,
                [domain.name]: row ? {min: row.bottom, max: row.top} : null
              });
            };
            return (
              <Highlight
                key={domain.name}
                drag
                highlightX={domain.name}
                onBrushEnd={trigger}
                onDragEnd={trigger}
                highlightWidth={(width - marginLeft - marginRight) / domains.length}
                enableX={false}
              />
            );
          })}
      </XYPlot>
    );
};

ParallelCoordinates.displayName = 'ParallelCoordinates';
ParallelCoordinates.propTypes = {
  animation: AnimationPropType,
  brushing: PropTypes.bool,
  className: PropTypes.string,
  colorType: PropTypes.string,
  colorRange: PropTypes.arrayOf(PropTypes.string),
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  domains: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      domain: PropTypes.arrayOf(PropTypes.number).isRequired,
      tickFormat: PropTypes.func
    })
  ).isRequired,
  height: PropTypes.number.isRequired,
  margin: MarginPropType,
  style: PropTypes.shape({
    axes: PropTypes.object,
    labels: PropTypes.object,
    lines: PropTypes.object
  }),
  showMarks: PropTypes.bool,
  tickFormat: PropTypes.func,
  width: PropTypes.number.isRequired
};
ParallelCoordinates.defaultProps = {
  className: '',
  colorType: 'category',
  colorRange: DISCRETE_COLOR_RANGE,
  style: DEFAULT_STYLE,
  tickFormat: DEFAULT_FORMAT
};

export default ParallelCoordinates;
