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
import {useAbstractSeries} from './abstract-series-hook';

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

function PolygonSeries(props: PolygonSeriesProps): JSX.Element | null {
  const {
    animation, className, data, marginLeft, marginTop, style,
    getAttributeFunctor, onSeriesMouseOverHandler, onSeriesMouseOutHandler,
    onSeriesClickHandler, onSeriesRightClickHandler
  } = {...props, ...useAbstractSeries(props)};

    if (!data) {
      return null;
    }

    if (animation) {
      return (
        <Animation {...props} animatedProps={ANIMATED_SERIES_PROPS}>
          <PolygonSeries {...props} animation={false} />
        </Animation>
      );
    }
    const xFunctor = getAttributeFunctor('x')!;
    const yFunctor = getAttributeFunctor('y')!;

    return (
      <path
        {...{
          className: getCombinedClassName(predefinedClassName, className),
          onMouseOver: onSeriesMouseOverHandler,
          onMouseOut: onSeriesMouseOutHandler,
          onClick: onSeriesClickHandler,
          onContextMenu: onSeriesRightClickHandler,
          fill: (props.color as string) || DEFAULT_COLOR,
          style,
          d: generatePath(data, xFunctor, yFunctor),
          transform: `translate(${marginLeft},${marginTop})`
        }}
      />
    );
  }

  (PolygonSeries as any).propTypes = {
    ...(AbstractSeries as any).propTypes
  };
(PolygonSeries as any).displayName = 'PolygonSeries';

export default PolygonSeries;
