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

import Animation from 'animation';
import {ANIMATED_SERIES_PROPS} from 'utils/series-utils';
import {getCombinedClassName} from 'utils/styling-utils';

import AbstractSeries, {AbstractSeriesProps} from './abstract-series';

const predefinedClassName = 'rv-xy-plot__series rv-xy-plot__series--polygon';
const DEFAULT_COLOR = '#12939A';

const generatePath = (
  data: any[],
  xFunctor: (d: any) => any,
  yFunctor: (d: any) => any
): string =>
  `${data.reduce(
    (res: string, row: any, i: number) =>
      `${res} ${i ? 'L' : 'M'}${xFunctor(row)} ${yFunctor(row)}`,
    ''
  )} Z`;

export interface PolygonSeriesProps extends AbstractSeriesProps<any> {}

class PolygonSeries extends AbstractSeries<any> {
  static get propTypes(): {[key: string]: any} {
    return {
      ...(AbstractSeries as any).propTypes
    };
  }

  render(): JSX.Element | null {
    const {
      animation,
      color,
      className,
      data,
      marginLeft,
      marginTop,
      style
    } = this.props as PolygonSeriesProps;

    if (!data) {
      return null;
    }

    if (animation) {
      return (
        <Animation {...this.props} animatedProps={ANIMATED_SERIES_PROPS}>
          <PolygonSeries {...this.props} animation={false} />
        </Animation>
      );
    }
    const xFunctor = this._getAttributeFunctor('x')!;
    const yFunctor = this._getAttributeFunctor('y')!;

    return (
      <path
        {...{
          className: getCombinedClassName(predefinedClassName, className),
          onMouseOver: this._seriesMouseOverHandler,
          onMouseOut: this._seriesMouseOutHandler,
          onClick: this._seriesClickHandler,
          onContextMenu: this._seriesRightClickHandler,
          fill: (color as string) || DEFAULT_COLOR,
          style,
          d: generatePath(data, xFunctor, yFunctor),
          transform: `translate(${marginLeft},${marginTop})`
        }}
      />
    );
  }
}

(PolygonSeries as any).displayName = 'PolygonSeries';

export default PolygonSeries;
