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
import {warning} from 'utils/react-utils';
import {getCombinedClassName} from 'utils/styling-utils';
import {DEFAULT_SIZE, DEFAULT_OPACITY} from 'theme';

import AbstractSeries, {AbstractSeriesProps} from './abstract-series';

const predefinedClassName = 'rv-xy-plot__series rv-xy-plot__series--mark';
const DEFAULT_STROKE_WIDTH = 1;

export interface MarkSeriesProps extends AbstractSeriesProps<any> {
  getNull?: (d: any) => boolean;
  nullAccessor?: (d: any) => boolean;
  strokeWidth?: number;
}

class MarkSeries extends AbstractSeries<any> {
  _renderCircle(
    d: any,
    i: number,
    strokeWidth: number | undefined,
    style: React.CSSProperties | {[key: string]: any},
    scalingFunctions: {
      fill: ((d: any) => any) | null;
      opacity: ((d: any) => any) | null;
      size: ((d: any) => any) | null;
      stroke: ((d: any) => any) | null;
      x: ((d: any) => any) | null;
      y: ((d: any) => any) | null;
    }
  ): JSX.Element {
    const {fill, opacity, size, stroke, x, y} = scalingFunctions;

    const attrs = {
      r: size ? size(d) : DEFAULT_SIZE,
      cx: x ? x(d) : 0,
      cy: y ? y(d) : 0,
      style: {
        opacity: opacity ? opacity(d) : DEFAULT_OPACITY,
        stroke: stroke && stroke(d),
        fill: fill && fill(d),
        strokeWidth: strokeWidth || DEFAULT_STROKE_WIDTH,
        ...style
      },
      key: i,
      onClick: (e: React.MouseEvent<SVGElement>) => this._valueClickHandler(d, e),
      onContextMenu: (e: React.MouseEvent<SVGElement>) => this._valueRightClickHandler(d, e),
      onMouseOver: (e: React.MouseEvent<SVGElement>) => this._valueMouseOverHandler(d, e),
      onMouseOut: (e: React.MouseEvent<SVGElement>) => this._valueMouseOutHandler(d, e)
    };
    return <circle {...attrs} />;
  }

  render(): JSX.Element | null {
    const {
      animation,
      className,
      data,
      marginLeft,
      marginTop,
      strokeWidth,
      style
    } = this.props as MarkSeriesProps;

    if ((this.props as MarkSeriesProps).nullAccessor) {
      warning('nullAccessor has been renamed to getNull', true);
    }

    const getNull =
      (this.props as MarkSeriesProps).nullAccessor ||
      (this.props as MarkSeriesProps).getNull ||
      (() => true);

    if (!data) {
      return null;
    }

    if (animation) {
      return (
        <Animation {...this.props} animatedProps={ANIMATED_SERIES_PROPS}>
          <MarkSeries {...this.props} animation={false} />
        </Animation>
      );
    }

    const scalingFunctions = {
      fill:
        this._getAttributeFunctor('fill') || this._getAttributeFunctor('color'),
      opacity: this._getAttributeFunctor('opacity'),
      size: this._getAttributeFunctor('size'),
      stroke:
        this._getAttributeFunctor('stroke') ||
        this._getAttributeFunctor('color'),
      x: this._getAttributeFunctor('x'),
      y: this._getAttributeFunctor('y')
    };

    return (
      <g
        className={getCombinedClassName(predefinedClassName, className)}
        transform={`translate(${marginLeft},${marginTop})`}
      >
        {data.map((d, i) => {
          return (
            getNull(d) &&
            this._renderCircle(d, i, strokeWidth, style as React.CSSProperties, scalingFunctions)
          );
        })}
      </g>
    );
  }
}

(MarkSeries as any).displayName = 'MarkSeries';
(MarkSeries as any).propTypes = {
  ...(AbstractSeries as any).propTypes,
  getNull: PropTypes.func,
  strokeWidth: PropTypes.number
};
(MarkSeries as any).defaultProps = {
  getNull: () => true
};

export default MarkSeries;
