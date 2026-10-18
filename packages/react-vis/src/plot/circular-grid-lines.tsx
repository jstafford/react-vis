// Copyright (c) 2016 Uber Technologies, Inc.
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
import {SeriesComponentType} from 'seriesComponentType';

import {getAttributeScale} from 'utils/scales-utils';
import {Animation} from 'animation';

import {getTicksTotalFromSize, getTickValues} from '../utils/axis-utils';

interface CircularGridLinesProps {
  centerX?: number;
  centerY?: number;
  width?: number;
  height?: number;
  top?: number;
  left?: number;
  rRange?: number[];
  style?: React.CSSProperties | {[key: string]: any};
  tickValues?: number[];
  tickTotal?: number;
  animation?: any;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  innerWidth?: number;
  innerHeight?: number;
  // [key: string]: any;
}

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
  'tickTotal'
];

export const CircularGridLines: SeriesComponentType<CircularGridLinesProps> = ({
  animation,
  centerX = 0,
  centerY = 0,
  ...restProps
}) => {
  const defaultProps = {
    left: restProps.marginLeft || 0,
    top: restProps.marginTop || 0,
    width: restProps.innerWidth || 0,
    height: restProps.innerHeight || 0,
    style: {},
    tickTotal: getTicksTotalFromSize(
      Math.min(restProps.innerWidth || 0, restProps.innerHeight || 0)
    )
  };
  const inputProps = {animation, centerX, centerY, ...restProps};
  if (animation) {
    return (
      <Animation {...inputProps} animatedProps={animatedProps}>
        <CircularGridLines {...inputProps} animation={undefined} />
      </Animation>
    );
  }

  const props = {
    ...defaultProps,
    ...inputProps
  };

    const {
      tickTotal,
      tickValues,
      marginLeft = 0,
      marginTop = 0,
      rRange,
      style
    } = props;

    const xScale = getAttributeScale(props, 'x') as (value: any) => number;
    const yScale = getAttributeScale(props, 'y') as (value: any) => number;
    const values = getTickValues(xScale as any, tickTotal, tickValues);
    return (
      <g
        transform={`translate(${xScale(centerX) + marginLeft},${yScale(
          centerY
        ) + marginTop})`}
        className="rv-xy-plot__circular-grid-lines"
      >
        {values.reduce((res: JSX.Element[], value, index) => {
          const radius = xScale(value);
          if (rRange && (radius < rRange[0] || radius > rRange[1])) {
            return res;
          }
          return res.concat([
            <circle
              {...{cx: 0, cy: 0, r: radius}}
              key={index}
              className="rv-xy-plot__circular-grid-lines__line"
              style={style}
            />
          ]);
        }, [])}
      </g>
    );
}
CircularGridLines.displayName = 'CircularGridLines';
CircularGridLines.requiresSVG = true;
