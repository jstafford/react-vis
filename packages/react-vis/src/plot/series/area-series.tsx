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

const predefinedClassName = 'rv-xy-plot__series rv-xy-plot__series--line';

export interface AreaSeriesProps extends AbstractSeriesProps<any> {
  curve?: string | ((arg: any) => any) | null;
  getNull?: (d: any) => boolean;
  nullAccessor?: (d: any) => boolean;
}

class AreaSeries extends AbstractSeries<any> {
  _renderArea(
    data: any[],
    x: (d: any) => any,
    y0: (d: any) => any,
    y: (d: any) => any,
    curve: string | ((arg: any) => any) | null,
    getNull: (d: any) => boolean
  ): string | null {
    let area = d3Shape.area<any>();
    if (curve !== null) {
      if (typeof curve === 'string' && (d3Shape as any)[curve]) {
        area = area.curve((d3Shape as any)[curve]);
      } else if (typeof curve === 'function') {
        area = area.curve(curve);
      }
    }
    area = area.defined(getNull);
    area = area
      .x(x)
      .y0(y0)
      .y1(y);
    return area(data);
  }

  render(): JSX.Element | null {
    const {
      animation,
      className,
      curve,
      data,
      marginLeft,
      marginTop,
      style
    } = this.props as AreaSeriesProps;

    if ((this.props as AreaSeriesProps).nullAccessor) {
      warning('nullAccessor has been renamed to getNull', true);
    }

    if (!data) {
      return null;
    }

    if (animation) {
      return (
        <Animation {...this.props} animatedProps={ANIMATED_SERIES_PROPS}>
          <AreaSeries {...this.props} animation={false} />
        </Animation>
      );
    }

    const x = this._getAttributeFunctor('x');
    const y = this._getAttributeFunctor('y');
    const y0 = this._getAttr0Functor('y');
    const stroke =
      this._getAttributeValue('stroke') || this._getAttributeValue('color');
    const fill =
      this._getAttributeValue('fill') || this._getAttributeValue('color');
    const newOpacity = this._getAttributeValue('opacity');
    const opacity = Number.isFinite(newOpacity) ? newOpacity : DEFAULT_OPACITY;
    const getNull =
      (this.props as AreaSeriesProps).nullAccessor ||
      (this.props as AreaSeriesProps).getNull ||
      (() => true);
    const d = this._renderArea(data, x as (d: any) => any, y0 as (d: any) => any, y as (d: any) => any, curve ?? null, getNull);

    return (
      <path
        d={d ?? undefined}
        className={getCombinedClassName(predefinedClassName, className)}
        transform={`translate(${marginLeft},${marginTop})`}
        onMouseOver={this._seriesMouseOverHandler}
        onMouseOut={this._seriesMouseOutHandler}
        onClick={this._seriesClickHandler}
        onContextMenu={this._seriesRightClickHandler}
        style={{
          opacity,
          stroke,
          fill,
          ...(style as React.CSSProperties)
        }}
      />
    );
  }
}

(AreaSeries as any).displayName = 'AreaSeries';
(AreaSeries as any).propTypes = {
  ...(AbstractSeries as any).propTypes,
  getNull: PropTypes.func
};
(AreaSeries as any).defaultProps = {
  ...(AbstractSeries as any).defaultProps,
  getNull: () => true
};

export default AreaSeries;
