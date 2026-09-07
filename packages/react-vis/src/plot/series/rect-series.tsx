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

import Animation from 'animation';
import {ANIMATED_SERIES_PROPS} from 'utils/series-utils';
import {getCombinedClassName} from 'utils/styling-utils';

import AbstractSeries, {AbstractSeriesProps} from './abstract-series';
import {useAbstractSeries} from './abstract-series-hook';

const predefinedClassName = 'rv-xy-plot__series rv-xy-plot__series--rect';

export interface RectSeriesProps extends AbstractSeriesProps<any> {
  linePosAttr?: string;
  valuePosAttr?: string;
  lineSizeAttr?: string;
  valueSizeAttr?: string;
}

function RectSeries(props: RectSeriesProps): JSX.Element | null {
  const {
    animation, className, data, linePosAttr, lineSizeAttr, marginLeft,
    marginTop, style, valuePosAttr, valueSizeAttr, getAttributeFunctor,
    getAttr0Functor, onValueClickHandler, onValueRightClickHandler,
    onValueMouseOverHandler, onValueMouseOutHandler
  } = {...props, ...useAbstractSeries(props)};

    if (!data) {
      return null;
    }

    if (animation) {
      return (
        <Animation {...props} animatedProps={ANIMATED_SERIES_PROPS}>
          <RectSeries {...props} animation={false} />
        </Animation>
      );
    }

    const lineFunctor = getAttributeFunctor(linePosAttr!);
    const line0Functor = getAttr0Functor(linePosAttr!);
    const valueFunctor = getAttributeFunctor(valuePosAttr!);
    const value0Functor = getAttr0Functor(valuePosAttr!);
    const fillFunctor =
      getAttributeFunctor('fill') || getAttributeFunctor('color');
    const strokeFunctor =
      getAttributeFunctor('stroke') || getAttributeFunctor('color');
    const opacityFunctor = getAttributeFunctor('opacity');

    return (
      <g
        className={getCombinedClassName(predefinedClassName, className)}
        transform={`translate(${marginLeft},${marginTop})`}
      >
        {data.map((d: any, i: number) => {
          const attrs: {[key: string]: any} = {
            style: {
              opacity: opacityFunctor && opacityFunctor(d),
              stroke: strokeFunctor && strokeFunctor(d),
              fill: fillFunctor && fillFunctor(d),
              ...style
            },
            [linePosAttr as string]: line0Functor!(d),
            [lineSizeAttr as string]: Math.abs(lineFunctor!(d) - line0Functor!(d)),
            [valuePosAttr as string]: Math.min(value0Functor!(d), valueFunctor!(d)),
            [valueSizeAttr as string]: Math.abs(-value0Functor!(d) + valueFunctor!(d)),
            onClick: (e: React.MouseEvent) => onValueClickHandler?.(d, e as any),
            onContextMenu: (e: React.MouseEvent) => onValueRightClickHandler?.(d, e as any),
            onMouseOver: (e: React.MouseEvent) => onValueMouseOverHandler?.(d, e as any),
            onMouseOut: (e: React.MouseEvent) => onValueMouseOutHandler?.(d, e as any)
          };
          return <rect key={String(i)} {...attrs} />;
        })}
      </g>
    );
  }

(RectSeries as any).propTypes = {
  ...(AbstractSeries as any).propTypes,
  linePosAttr: PropTypes.string,
  valuePosAttr: PropTypes.string,
  lineSizeAttr: PropTypes.string,
  valueSizeAttr: PropTypes.string
};

(RectSeries as any).displayName = 'RectSeries';

export default RectSeries;
