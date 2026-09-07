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
import {hexbin} from 'd3-hexbin';
import {scaleLinear} from 'd3-scale';

import {ANIMATED_SERIES_PROPS} from 'utils/series-utils';
import {getCombinedClassName} from 'utils/styling-utils';
import {CONTINUOUS_COLOR_RANGE} from 'theme';
import AbstractSeries, {AbstractSeriesProps} from './abstract-series';
import {useAbstractSeries} from './abstract-series-hook';

const predefinedClassName = 'rv-xy-plot__series rv-xy-plot__series--hexbin';

export interface HexbinSeriesProps extends AbstractSeriesProps<any> {
  radius?: number;
  colorRange?: string[];
  countDomain?: [number, number];
  sizeHexagonsWithCount?: boolean;
  xOffset?: number;
  yOffset?: number;
}

function getColorDomain(
  props: HexbinSeriesProps,
  hexes: Array<any[]>
): [number, number] {
  if (props.countDomain) {
    return props.countDomain;
  }
  return [0, Math.max(...hexes.map(row => row.length))];
}

function HexbinSeries(props: HexbinSeriesProps): JSX.Element | null {
  const {
    getAttributeFunctor,
    ...series
  } = {...props, ...useAbstractSeries(props)};
  const {
      animation,
      className,
      colorRange,
      data,
      innerHeight,
      innerWidth,
      marginLeft,
      marginTop,
      radius,
      sizeHexagonsWithCount,
      style,
      xOffset,
      yOffset
    } = series as HexbinSeriesProps;

    if (!data) {
      return null;
    }

    if (animation) {
      return (
        <Animation {...props} animatedProps={ANIMATED_SERIES_PROPS}>
          <HexbinSeries {...props} animation={false} />
        </Animation>
      );
    }
    const x = getAttributeFunctor('x')!;
    const y = getAttributeFunctor('y')!;

    const hex = hexbin()
      .x((d: any) => x(d) + (xOffset ?? 0))
      .y((d: any) => y(d) + (yOffset ?? 0))
      .radius(radius ?? 20)
      .size([innerWidth ?? 0, innerHeight ?? 0]);

    const hexagonPath = hex.hexagon();
    const hexes = hex(data);

    const countDomain = getColorDomain(props, hexes);
    const color = scaleLinear<string>()
      .domain(countDomain)
      .range((colorRange || CONTINUOUS_COLOR_RANGE) as string[]);
    const size = scaleLinear()
      .domain(countDomain)
      .range([0, radius ?? 20]);
    return (
      <g
        className={getCombinedClassName(predefinedClassName, className)}
        transform={`translate(${marginLeft},${marginTop})`}
      >
        {hexes.map((d: any, i: number) => {
          const attrs = {
            style,
            d: sizeHexagonsWithCount
              ? hex.hexagon(size(d.length))
              : hexagonPath,
            fill: color(d.length),
            transform: `translate(${d.x}, ${d.y})`,
            onClick: (e: React.MouseEvent<SVGElement>) => series.onValueClickHandler?.(d, e),
            onContextMenu: (e: React.MouseEvent<SVGElement>) => series.onValueRightClickHandler?.(d, e),
            onMouseOver: (e: React.MouseEvent<SVGElement>) => series.onValueMouseOverHandler?.(d, e),
            onMouseOut: (e: React.MouseEvent<SVGElement>) => series.onValueMouseOutHandler?.(d, e)
          };
          return <path key={String(i)} {...attrs} />;
        })}
      </g>
    );
  }

(HexbinSeries as any).propTypes = {
  ...(AbstractSeries as any).propTypes,
  radius: PropTypes.number
};

(HexbinSeries as any).defaultProps = {
  radius: 20,
  colorRange: CONTINUOUS_COLOR_RANGE,
  xOffset: 0,
  yOffset: 0
};

(HexbinSeries as any).displayName = 'HexbinSeries';

export default HexbinSeries;
