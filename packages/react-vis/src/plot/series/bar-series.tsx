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
import {ANIMATED_SERIES_PROPS, getStackParams} from 'utils/series-utils';
import {getCombinedClassName} from 'utils/styling-utils';

import AbstractSeries, {AbstractSeriesProps} from './abstract-series';
import {useAbstractSeries} from './abstract-series-hook';

const predefinedClassName = 'rv-xy-plot__series rv-xy-plot__series--bar';

export interface BarSeriesProps extends AbstractSeriesProps<any> {
  linePosAttr?: string;
  valuePosAttr?: string;
  lineSizeAttr?: string;
  valueSizeAttr?: string;
  cluster?: string;
  barWidth?: number;
}

function BarSeries(props: BarSeriesProps): JSX.Element | null {
  const {
    animation, className, data, linePosAttr, lineSizeAttr, marginLeft,
    marginTop, style, valuePosAttr, valueSizeAttr, barWidth,
    getScaleDistance, getAttributeFunctor, getAttr0Functor,
    onValueClickHandler, onValueRightClickHandler, onValueMouseOverHandler,
    onValueMouseOutHandler
  } = {...props, ...useAbstractSeries(props)};

    if (!data) {
      return null;
    }

    if (animation) {
      return (
        <Animation {...props} animatedProps={ANIMATED_SERIES_PROPS}>
          <BarSeries {...props} animation={false} />
        </Animation>
      );
    }

    const {sameTypeTotal, sameTypeIndex} = getStackParams(props as any);

    const distance = getScaleDistance(linePosAttr as string);
    const lineFunctor = getAttributeFunctor(linePosAttr as string);
    const valueFunctor = getAttributeFunctor(valuePosAttr as string);
    const value0Functor = getAttr0Functor(valuePosAttr as string);
    const fillFunctor =
      getAttributeFunctor('fill') || getAttributeFunctor('color');
    const strokeFunctor =
      getAttributeFunctor('stroke') || getAttributeFunctor('color');
    const opacityFunctor = getAttributeFunctor('opacity');

    const halfSpace = (distance / 2) * (barWidth as number);

    return (
      <g
        className={getCombinedClassName(predefinedClassName, className)}
        transform={`translate(${marginLeft},${marginTop})`}
      >
        {data.map((d, i) => {
          // totalSpaceAvailable is the space we have available to draw all the
          // bars of a same 'linePosAttr' value (a.k.a. sameTypeTotal)
          const totalSpaceAvailable = halfSpace * 2;
          const totalSpaceCenter = lineFunctor!(d);
          // totalSpaceStartingPoint is the first pixel were we can start drawing
          const totalSpaceStartingPoint = totalSpaceCenter - halfSpace;
          // spaceTakenByInterBarsPixels has the overhead space consumed by each bar of sameTypeTotal
          const spaceTakenByInterBarsPixels =
            (sameTypeTotal - 1) / sameTypeTotal;
          // spacePerBar is the space we have available to draw sameTypeIndex bar
          const spacePerBar =
            totalSpaceAvailable / sameTypeTotal - spaceTakenByInterBarsPixels;
          // barStartingPoint is the first pixel were we can start drawing sameTypeIndex bar
          const barStartingPoint =
            totalSpaceStartingPoint +
            spacePerBar * sameTypeIndex +
            sameTypeIndex;

          const attrs: {[key: string]: any} = {
            style: {
              opacity: opacityFunctor && opacityFunctor(d),
              stroke: strokeFunctor && strokeFunctor(d),
              fill: fillFunctor && fillFunctor(d),
              ...(style as React.CSSProperties)
            },
            [linePosAttr as string]: barStartingPoint,
            [lineSizeAttr as string]: spacePerBar,
            [valuePosAttr as string]: Math.min(value0Functor!(d), valueFunctor!(d)),
            [valueSizeAttr as string]: Math.abs(-value0Functor!(d) + valueFunctor!(d)),
            onClick: (e: React.MouseEvent<SVGElement>) => onValueClickHandler?.(d, e),
            onContextMenu: (e: React.MouseEvent<SVGElement>) => onValueRightClickHandler?.(d, e),
            onMouseOver: (e: React.MouseEvent<SVGElement>) => onValueMouseOverHandler?.(d, e),
            onMouseOut: (e: React.MouseEvent<SVGElement>) => onValueMouseOutHandler?.(d, e)
          };
          return <rect key={`${i}`} {...attrs} />;
        })}
      </g>
    );
  }

(BarSeries as any).propTypes = {
  ...(AbstractSeries as any).propTypes,
  linePosAttr: PropTypes.string,
  valuePosAttr: PropTypes.string,
  lineSizeAttr: PropTypes.string,
  valueSizeAttr: PropTypes.string,
  cluster: PropTypes.string,
  barWidth: PropTypes.number
};
(BarSeries as any).defaultProps = {barWidth: 0.85};

(BarSeries as any).displayName = 'BarSeries';

export default BarSeries;
