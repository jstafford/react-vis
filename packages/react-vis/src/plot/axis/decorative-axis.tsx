// Copyright (c) 2017 Uber Technologies, Inc.
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
import {format} from 'd3-format';

import {AbstractSeriesProps} from 'plot/series/abstract-series';
import {DecorativeAxisTicks} from './decorative-axis-ticks';
import {Animation} from 'animation';
import {getCombinedClassName} from 'utils/styling-utils';
import {getAttributeFunctor} from 'utils/scales-utils';

const predefinedClassName = 'rv-xy-manipulable-axis rv-xy-plot__axis';
const formatTickValue = (value: number) =>
  value === 0 ? '0.0' : format('.2r')(value);

const animatedProps = [
  'xRange',
  'yRange',
  'xDomain',
  'yDomain',
  'width',
  'height',
  'marginLeft',
  'marginTop',
  'marginRight',
  'marginBottom',
  'tickSize',
  'tickTotal',
  'tickSizeInner',
  'tickSizeOuter'
];

interface DecorativeAxisStyle extends React.CSSProperties {
  line?: React.SVGAttributes<SVGLineElement>;
  ticks?: React.SVGAttributes<SVGLineElement>;
  text?: React.SVGAttributes<SVGTextElement>;
}

export interface DecorativeAxisProps extends Omit<AbstractSeriesProps, 'style'> {
  axisDomain: number[];
  axisEnd: {
    x?: number | string;
    y?: number | string;
  };
  axisStart: {
    x?: number | string;
    y?: number | string;
  };
  className?: string;
  numberOfTicks?: number;
  tickValue?: (d: any) => string | number;
  tickSize?: number;
  style?: DecorativeAxisStyle;
}

export function DecorativeAxis(props: DecorativeAxisProps): JSX.Element {
  const {
    animation,
    className = '',
    marginLeft = 0,
    marginTop = 0,
    axisStart,
    axisEnd,
    axisDomain,
    numberOfTicks = 10,
    tickValue = DEFAULT_FORMAT,
    tickSize = 5,
    style = {
      line: {strokeWidth: 1},
      ticks: {strokeWidth: 2},
      text: {}
    }
  } = props;

  if (animation) {
    return (
      <Animation {...props} {...{animatedProps}}>
        <DecorativeAxis {...props} animation={null as any} />
      </Animation>
    );
  }

  const x = getAttributeFunctor(props, 'x') as (datum: any) => number;
  const y = getAttributeFunctor(props, 'y') as (datum: any) => number;

  return (
    <g
      className={getCombinedClassName(predefinedClassName, className)}
      transform={`translate(${marginLeft},${marginTop})`}
    >
      <line
        {...{
          x1: x({x: axisStart.x}),
          x2: x({x: axisEnd.x}),
          y1: y({y: axisStart.y}),
          y2: y({y: axisEnd.y}),
          ...style.line
        }}
        className="rv-xy-plot__axis__line"
      />
      <g className="rv-xy-manipulable-axis__ticks">
        {DecorativeAxisTicks({
          axisDomain,
          axisEnd: {x: x(axisEnd), y: y(axisEnd)},
          axisStart: {x: x(axisStart), y: y(axisStart)},
          numberOfTicks,
          tickValue,
          tickSize,
          style
        })}
      </g>
    </g>
  );
}

const DEFAULT_FORMAT = formatTickValue;

(DecorativeAxis as any).displayName = 'DecorativeAxis';
(DecorativeAxis as any).requiresSVG = true;
(DecorativeAxis as any).defaultProps = {
  className: '',
  numberOfTicks: 10,
  tickValue: (d: any) => DEFAULT_FORMAT(d),
  tickSize: 5,
  style: {
    line: {strokeWidth: 1},
    ticks: {strokeWidth: 2},
    text: {}
  }
};
