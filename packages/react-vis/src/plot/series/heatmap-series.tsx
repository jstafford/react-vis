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

const predefinedClassName = 'rv-xy-plot__series rv-xy-plot__series--heatmap';

export interface HeatmapSeriesProps extends AbstractSeriesProps<any> {}

function HeatmapSeries(props: HeatmapSeriesProps): JSX.Element | null {
  const {
    animation, className, data, marginLeft, marginTop, style,
    getAttributeFunctor, getScaleDistance,
    onValueClickHandler, onValueRightClickHandler, onValueMouseOverHandler,
    onValueMouseOutHandler
  } = {...props, ...useAbstractSeries(props)};
    if (!data) {
      return null;
    }
    if (animation) {
      return (
        <Animation {...props} animatedProps={ANIMATED_SERIES_PROPS}>
          <HeatmapSeries {...props} animation={false} />
        </Animation>
      );
    }
    const rectStyle: {[key: string]: any} = ((style as any) || {}).rectStyle || {};
    const x = getAttributeFunctor('x')!;
    const y = getAttributeFunctor('y')!;
    const opacity = getAttributeFunctor('opacity');
    const fill =
      getAttributeFunctor('fill') || getAttributeFunctor('color');
    const stroke =
      getAttributeFunctor('stroke') || getAttributeFunctor('color');
    const xDistance = getScaleDistance('x');
    const yDistance = getScaleDistance('y');
    return (
      <g
        className={getCombinedClassName(predefinedClassName, className)}
        transform={`translate(${marginLeft},${marginTop})`}
      >
        {data.map((d: any, i: number) => {
          const attrs = {
            style: {
              stroke: stroke && stroke(d),
              fill: fill && fill(d),
              opacity: opacity && opacity(d),
              ...(style as React.CSSProperties)
            },
            ...rectStyle,
            x: x(d) - xDistance / 2,
            y: y(d) - yDistance / 2,
            width: xDistance,
            height: yDistance,
            onClick: (e: React.MouseEvent<SVGElement>) => onValueClickHandler?.(d, e),
            onContextMenu: (e: React.MouseEvent<SVGElement>) => onValueRightClickHandler?.(d, e),
            onMouseOver: (e: React.MouseEvent<SVGElement>) => onValueMouseOverHandler?.(d, e),
            onMouseOut: (e: React.MouseEvent<SVGElement>) => onValueMouseOutHandler?.(d, e)
          };
          return <rect key={i} {...attrs} />;
        })}
      </g>
    );
  }

namespace HeatmapSeries {
  export function getParentConfig(attr: string): {isDomainAdjustmentNeeded: boolean} {
    return {isDomainAdjustmentNeeded: attr === 'x' || attr === 'y'};
  }
}

(HeatmapSeries as any).propTypes = {
  ...(AbstractSeries as any).propTypes
};

(HeatmapSeries as any).displayName = 'HeatmapSeries';

export default HeatmapSeries;
