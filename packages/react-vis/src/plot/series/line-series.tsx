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
import {SeriesComponentType} from 'seriesComponentType';

import * as d3Shape from 'd3-shape';

import {Animation} from 'animation';
import {DEFAULT_OPACITY} from 'theme';
import {ANIMATED_SERIES_PROPS} from 'utils/series-utils';
import {warning} from 'utils/react-utils';
import {getCombinedClassName} from 'utils/styling-utils';

import {AbstractSeriesProps, useAbstractSeries} from './abstract-series-hook';

const predefinedClassName = 'rv-xy-plot__series rv-xy-plot__series--line';

const STROKE_STYLES: {[key: string]: string | null} = {
  dashed: '6, 2',
  solid: null
};

export interface LineSeriesProps extends AbstractSeriesProps<any> {
  strokeStyle?: string;
  curve?: string | ((arg: any) => any) | null;
  getNull?: (d: any) => boolean;
  nullAccessor?: (d: any) => boolean;
  strokeDasharray?: string;
  strokeWidth?: number | string;
}

const renderLine = (data: any[],
    x: (d: any) => any,
    y: (d: any) => any,
    curve: string | ((arg: any) => any) | null,
    getNull: (d: any) => boolean): string | null => {
    let line = d3Shape.line<any>();
    if (curve !== null) {
      if (typeof curve === 'string' && (d3Shape as any)[curve]) {
        line = line.curve((d3Shape as any)[curve]);
      } else if (typeof curve === 'function') {
        line = line.curve(curve);
      }
    }
    line = line.defined(getNull);
    line = line.x(x).y(y);
    return line(data);
  };

export const LineSeries: SeriesComponentType<LineSeriesProps> = ({
  className = '',
  stack = false,
  style = {},
  strokeStyle = 'solid',
  opacity = 1,
  curve = null,
  getNull = () => true,
  ...restProps
}): JSX.Element | null => {
  const allprops: LineSeriesProps = {
    ...restProps,
    className,
    stack,
    style,
    strokeStyle,
    curve,
    getNull
  };
  const {
    animation, data, getAttributeFunctor, getAttributeValue,
    marginLeft, marginTop, strokeDasharray, strokeWidth,
    onSeriesMouseOverHandler, onSeriesMouseOutHandler, onSeriesClickHandler,
    onSeriesRightClickHandler
  } = {...allprops, ...useAbstractSeries(allprops)};

    if (allprops.nullAccessor) {
      warning('nullAccessor has been renamed to getNull', true);
    }

    if (!data) {
      return null;
    }

    if (animation) {
      return (
        <Animation {...allprops} animatedProps={ANIMATED_SERIES_PROPS}>
          <LineSeries {...allprops} animation={false} />
        </Animation>
      );
    }

    const x = getAttributeFunctor('x');
    const y = getAttributeFunctor('y');
    const stroke =
      getAttributeValue('stroke') || getAttributeValue('color');
    const newOpacity = getAttributeValue('opacity');
    const newOpacityFinite = Number.isFinite(newOpacity) ? newOpacity : DEFAULT_OPACITY;
    const d = renderLine(data, x as (d: any) => any, y as (d: any) => any, curve ?? null, getNull);

    return (
      <path
        d={d ?? undefined}
        className={getCombinedClassName(predefinedClassName, className)}
        transform={`translate(${marginLeft},${marginTop})`}
        onMouseOver={onSeriesMouseOverHandler}
        onMouseOut={onSeriesMouseOutHandler}
        onClick={onSeriesClickHandler}
        onContextMenu={onSeriesRightClickHandler}
        style={{
          opacity: newOpacityFinite,
          strokeDasharray: STROKE_STYLES[strokeStyle as string] || strokeDasharray,
          strokeWidth,
          stroke,
          // JPS: Added fill none.  Otherwise non-vis applications (ppt)
          // will 'fill' our line series which is hard to explain, but clearly wrong.
          fill:'none',
          ...(style as React.CSSProperties)
        }}
      />
    );
  };
LineSeries.displayName = 'LineSeries';
LineSeries.requiresSVG = true;
