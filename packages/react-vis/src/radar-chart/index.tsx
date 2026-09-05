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

import React from 'react';
import PropTypes from 'prop-types';
import {scaleLinear} from 'd3-scale';
import {format} from 'd3-format';

import {AnimationPropType} from 'animation';
import XYPlot from 'plot/xy-plot';
import {DISCRETE_COLOR_RANGE} from 'theme';
import {MarginPropType} from 'utils/chart-utils';
import {getCombinedClassName} from 'utils/styling-utils';
import MarkSeries from 'plot/series/mark-series';
import PolygonSeries from 'plot/series/polygon-series';
import LabelSeries from 'plot/series/label-series';
import DecorativeAxis from 'plot/axis/decorative-axis';

export interface RadarDomain {
  name: string;
  domain: number[];
  tickFormat?: (value: number) => string;
  getValue?: (row: RadarDatum) => number;
}

export interface RadarDatum {
  name?: string;
  color?: string;
  fill?: string;
  stroke?: string;
  [key: string]: any;
}

export interface RadarStyle {
  axes?: React.CSSProperties;
  labels?: React.CSSProperties;
  polygons?: React.CSSProperties;
}

export interface RadarChartProps {
  animation?: any;
  className?: string;
  children?: React.ReactNode;
  colorRange?: string[];
  data: RadarDatum[];
  domains: RadarDomain[];
  height: number;
  hideInnerMostValues?: boolean;
  margin?: any;
  onMouseLeave?: (event: React.MouseEvent) => void;
  onMouseEnter?: (event: React.MouseEvent) => void;
  startingAngle?: number;
  style?: RadarStyle;
  tickFormat?: (value: number) => string;
  width: number;
  renderAxesOverPolygons?: boolean;
  onValueMouseOver?: (info: any) => void;
  onValueMouseOut?: (info: any) => void;
  onSeriesMouseOver?: (info: any) => void;
  onSeriesMouseOut?: (info: any) => void;
  [key: string]: any;
}

const predefinedClassName = 'rv-radar-chart';
const DEFAULT_FORMAT = (value: number) =>
  value === 0 ? '0.0' : format('.2r')(value);
/**
 * Generate axes for each of the domains
 * @param {Object} props
 - props.animation {Boolean}
 - props.domains {Array} array of object specifying the way each axis is to be plotted
 - props.style {object} style object for the whole chart
 - props.tickFormat {Function} formatting function for axes
 - props.startingAngle {number} the initial angle offset
 * @return {Array} the plotted axis components
 */
function getAxes(props: any): React.ReactNode[] {
  const {
    animation,
    domains,
    startingAngle,
    style,
    tickFormat,
    hideInnerMostValues
  } = props;
  return domains.map((domain: RadarDomain, index: number) => {
    const angle = (index / domains.length) * Math.PI * 2 + startingAngle;
    const sortedDomain = domain.domain;

    const domainTickFormat = (t: number) => {
      if (hideInnerMostValues && t === sortedDomain[0]) {
        return '';
      }
      return domain.tickFormat ? domain.tickFormat(t) : tickFormat(t);
    };

    return (
      <DecorativeAxis
        animation={animation}
        key={`${index}-axis`}
        axisStart={{x: 0, y: 0}}
        axisEnd={{
          x: getCoordinate(Math.cos(angle)),
          y: getCoordinate(Math.sin(angle))
        }}
        axisDomain={sortedDomain}
        numberOfTicks={5}
        tickValue={domainTickFormat}
        style={style.axes}
      />
    );
  });
}

/**
 * Generate x or y coordinate for axisEnd
 * @param {Number} axisEndPoint
 - epsilon is an arbitrarily chosen small number to approximate axisEndPoints
 - to true values resulting from trigonometry functions (sin, cos) on angles
 * @return {Number} the x or y coordinate accounting for exact trig values
 */
function getCoordinate(axisEndPoint: number): number {
  const epsilon = 10e-13;
  if (Math.abs(axisEndPoint) <= epsilon) {
    axisEndPoint = 0;
  } else if (axisEndPoint > 0) {
    if (Math.abs(axisEndPoint - 0.5) <= epsilon) {
      axisEndPoint = 0.5;
    }
  } else if (axisEndPoint < 0) {
    if (Math.abs(axisEndPoint + 0.5) <= epsilon) {
      axisEndPoint = -0.5;
    }
  }
  return axisEndPoint;
}

/**
 * Generate labels for the ends of the axes
 * @param {Object} props
 - props.domains {Array} array of object specifying the way each axis is to be plotted
  - props.startingAngle {number} the initial angle offset
 - props.style {object} style object for just the labels
 * @return {Array} the prepped data for the labelSeries
 */
function getLabels(props: any): any[] {
  const {domains, startingAngle, style} = props;
  return domains.map(({name}: RadarDomain, index: number) => {
    const angle = (index / domains.length) * Math.PI * 2 + startingAngle;
    const radius = 1.2;
    return {
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
      label: name,
      style
    };
  });
}

/**
 * Generate the actual polygons to be plotted
 * @param {Object} props
 - props.animation {Boolean}
 - props.data {Array} array of object specifying what values are to be plotted
 - props.domains {Array} array of object specifying the way each axis is to be plotted
 - props.startingAngle {number} the initial angle offset
 - props.style {object} style object for the whole chart
 * @return {Array} the plotted axis components
 */
function getPolygons(props: any): React.ReactNode[] {
  const {
    animation,
    colorRange,
    domains,
    data,
    style,
    startingAngle,
    onSeriesMouseOver,
    onSeriesMouseOut
  } = props;

  const scales = domains.reduce((acc: Record<string, any>, {domain, name}: RadarDomain) => {
    acc[name] = scaleLinear()
      .domain(domain)
      .range([0, 1]);
    return acc;
  }, {});

  return data.map((row: RadarDatum, rowIndex: number) => {
    const mappedData = domains.map(({name, getValue}: RadarDomain, index: number) => {
      const dataPoint = getValue ? getValue(row) : row[name];
      // error handling if point doesn't exist
      const angle = (index / domains.length) * Math.PI * 2 + startingAngle;
      // dont let the radius become negative
      const radius = Math.max(scales[name](dataPoint), 0);
      return {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
        name: row.name
      };
    });

    const handleSeriesMouseOver = (info: any) => {
      if (onSeriesMouseOver) {
        onSeriesMouseOver({...info, row});
      }
    };

    const handleSeriesMouseOut = (info: any) => {
      if (onSeriesMouseOut) {
        onSeriesMouseOut({...info, row});
      }
    };

    return (
      <PolygonSeries
        animation={animation}
        className={`${predefinedClassName}-polygon`}
        key={`${rowIndex}-polygon`}
        data={mappedData}
        style={{
          stroke:
            row.color || row.stroke || colorRange[rowIndex % colorRange.length],
          fill:
            row.color || row.fill || colorRange[rowIndex % colorRange.length],
          ...style.polygons
        }}
        onSeriesMouseOver={handleSeriesMouseOver}
        onSeriesMouseOut={handleSeriesMouseOut}
      />
    );
  });
}

/**
 * Generate circles at the polygon points for Hover functionality
 * @param {Object} props
 - props.animation {Boolean}
 - props.data {Array} array of object specifying what values are to be plotted
 - props.domains {Array} array of object specifying the way each axis is to be plotted
 - props.startingAngle {number} the initial angle offset
 - props.style {object} style object for the whole chart
 - props.onValueMouseOver {function} function to call on mouse over a polygon point
 - props.onValueMouseOver {function} function to call when mouse leaves a polygon point
 * @return {Array} the plotted axis components
 */
function getPolygonPoints(props: any): React.ReactNode[] | undefined {
  const {
    animation,
    domains,
    data,
    startingAngle,
    style,
    onValueMouseOver,
    onValueMouseOut
  } = props;
  if (!onValueMouseOver) {
    return;
  }
  const scales = domains.reduce((acc: Record<string, any>, {domain, name}: RadarDomain) => {
    acc[name] = scaleLinear()
      .domain(domain)
      .range([0, 1]);
    return acc;
  }, {});
  return data.map((row: RadarDatum, rowIndex: number) => {
    const mappedData = domains.map(({name, getValue}: RadarDomain, index: number) => {
      const dataPoint = getValue ? getValue(row) : row[name];
      // error handling if point doesn't exist
      const angle = (index / domains.length) * Math.PI * 2 + startingAngle;
      // dont let the radius become negative
      const radius = Math.max(scales[name](dataPoint), 0);
      return {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
        domain: name,
        value: dataPoint,
        dataName: row.name
      };
    });

    return (
      <MarkSeries
        animation={animation}
        className={`${predefinedClassName}-polygonPoint`}
        key={`${rowIndex}-polygonPoint`}
        data={mappedData}
        size={10}
        style={{
          ...style.polygons,
          fill: 'transparent',
          stroke: 'transparent'
        }}
        onValueMouseOver={onValueMouseOver}
        onValueMouseOut={onValueMouseOut}
      />
    );
  });
}

function RadarChart(props: RadarChartProps): JSX.Element {
  const {
    animation,
    className,
    children,
    colorRange,
    data,
    domains,
    height,
    hideInnerMostValues,
    margin,
    onMouseLeave,
    onMouseEnter,
    startingAngle,
    style,
    tickFormat,
    width,
    renderAxesOverPolygons,
    onValueMouseOver,
    onValueMouseOut,
    onSeriesMouseOver,
    onSeriesMouseOut
  } = props;

  const axes = getAxes({
    domains,
    animation,
    hideInnerMostValues,
    startingAngle,
    style,
    tickFormat
  });

  const polygons = getPolygons({
    animation,
    colorRange,
    domains,
    data,
    startingAngle,
    style,
    onSeriesMouseOver,
    onSeriesMouseOut
  });

  const polygonPoints = getPolygonPoints({
    animation,
    colorRange,
    domains,
    data,
    startingAngle,
    style,
    onValueMouseOver,
    onValueMouseOut
  });

  const labelSeries = (
    <LabelSeries
      animation={animation}
      key={className}
      className={`${predefinedClassName}-label`}
      data={getLabels({domains, style: style?.labels, startingAngle})}
    />
  );
  return (
    <XYPlot
      height={height}
      width={width}
      margin={margin}
      dontCheckIfEmpty
      className={getCombinedClassName(className, predefinedClassName)}
      onMouseLeave={onMouseLeave as any}
      onMouseEnter={onMouseEnter as any}
      xDomain={[-1, 1]}
      yDomain={[-1, 1]}
    >
      {children}
      {!renderAxesOverPolygons &&
        axes
          .concat(polygons)
          .concat(labelSeries)
          .concat(polygonPoints)}
      {renderAxesOverPolygons &&
        polygons
          .concat(labelSeries)
          .concat(axes)
          .concat(polygonPoints)}
    </XYPlot>
  );
}

(RadarChart as any).displayName = 'RadarChart';
(RadarChart as any).propTypes = {
  animation: AnimationPropType,
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
  hideInnerMostValues: PropTypes.bool,
  margin: MarginPropType,
  startingAngle: PropTypes.number,
  style: PropTypes.shape({
    axes: PropTypes.object,
    labels: PropTypes.object,
    polygons: PropTypes.object
  }),
  tickFormat: PropTypes.func,
  width: PropTypes.number.isRequired,
  renderAxesOverPolygons: PropTypes.bool,
  onValueMouseOver: PropTypes.func,
  onValueMouseOut: PropTypes.func,
  onSeriesMouseOver: PropTypes.func,
  onSeriesMouseOut: PropTypes.func
};
(RadarChart as any).defaultProps = {
  className: '',
  colorType: 'category',
  colorRange: DISCRETE_COLOR_RANGE,
  hideInnerMostValues: true,
  startingAngle: Math.PI / 2,
  style: {
    axes: {
      line: {},
      ticks: {},
      text: {}
    },
    labels: {
      fontSize: 10,
      textAnchor: 'middle'
    },
    polygons: {
      strokeWidth: 0.5,
      strokeOpacity: 1,
      fillOpacity: 0.1
    }
  },
  tickFormat: DEFAULT_FORMAT,
  renderAxesOverPolygons: false
};

export default RadarChart;
