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
import * as d3Shape from 'd3-shape';

import Animation from 'animation';
import {DEFAULT_OPACITY} from 'theme';
import {ANIMATED_SERIES_PROPS} from 'utils/series-utils';
import {warning} from 'utils/react-utils';
import {getCombinedClassName} from 'utils/styling-utils';

import AbstractSeries, {AbstractSeriesProps} from './abstract-series';
import {useAbstractSeries} from './abstract-series-hook';

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

function renderLine(
    data: any[],
    x: (d: any) => any,
    y: (d: any) => any,
    curve: string | ((arg: any) => any) | null,
    getNull: (d: any) => boolean
  ): string | null {
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
  }

function LineSeries(props: LineSeriesProps): JSX.Element | null {
  const {
    animation, className, data, getAttributeFunctor, getAttributeValue,
    marginLeft, marginTop, strokeDasharray, strokeStyle, strokeWidth, style,
    onSeriesMouseOverHandler, onSeriesMouseOutHandler, onSeriesClickHandler,
    onSeriesRightClickHandler
  } = {...props, ...useAbstractSeries(props)};

    if (props.nullAccessor) {
      warning('nullAccessor has been renamed to getNull', true);
    }

    if (!data) {
      return null;
    }

    if (animation) {
      return (
        <Animation {...props} animatedProps={ANIMATED_SERIES_PROPS}>
          <LineSeries {...props} animation={false} />
        </Animation>
      );
    }

    const {curve} = props;

    const x = getAttributeFunctor('x');
    const y = getAttributeFunctor('y');
    const stroke =
      getAttributeValue('stroke') || getAttributeValue('color');
    const newOpacity = getAttributeValue('opacity');
    const opacity = Number.isFinite(newOpacity) ? newOpacity : DEFAULT_OPACITY;
    const getNull =
      props.nullAccessor ||
      props.getNull ||
      (() => true);
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
          opacity,
          strokeDasharray: STROKE_STYLES[strokeStyle as string] || strokeDasharray,
          strokeWidth,
          stroke,
          ...(style as React.CSSProperties)
        }}
      />
    );
  }

(LineSeries as any).displayName = 'LineSeries';
(LineSeries as any).propTypes = {
  ...(AbstractSeries as any).propTypes,
  strokeStyle: PropTypes.oneOf(Object.keys(STROKE_STYLES)),
  curve: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  getNull: PropTypes.func
};
(LineSeries as any).defaultProps = {
  ...(AbstractSeries as any).defaultProps,
  strokeStyle: 'solid',
  style: {},
  opacity: 1,
  curve: null,
  className: '',
  getNull: () => true
};

export default LineSeries;
