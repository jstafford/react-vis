// Copyright (c) 2017 Uber Technologies, Inc.
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

import AbstractSeries, {AbstractSeriesProps} from './abstract-series';
import Animation from 'animation';
import {ANIMATED_SERIES_PROPS} from 'utils/series-utils';
import {getCombinedClassName} from 'utils/styling-utils';

const predefinedClassName = 'rv-xy-plot__series rv-xy-plot__series--label';

export interface LabelSeriesProps extends AbstractSeriesProps<any> {
  allowOffsetToBeReversed?: boolean;
  getLabel?: (d: any) => string;
  rotation?: number;
  xRange?: number[];
  yRange?: number[];
  labelAnchorX?: string;
  labelAnchorY?: string;
  _data?: any[];
}

const getTextAnchor = (labelAnchorX: string | undefined, leftOfMiddle: boolean): string => {
  return labelAnchorX ? labelAnchorX : leftOfMiddle ? 'start' : 'end';
};
const getDominantBaseline = (labelAnchorY: string | undefined, aboveMiddle: boolean): string => {
  return labelAnchorY
    ? labelAnchorY
    : aboveMiddle
    ? 'text-before-edge'
    : 'text-after-edge';
};

class LabelSeries extends AbstractSeries<any> {
  render(): JSX.Element | null {
    const {
      animation,
      allowOffsetToBeReversed,
      className,
      data,
      _data,
      getLabel,
      marginLeft,
      marginTop,
      rotation,
      style,
      xRange,
      yRange,
      labelAnchorX,
      labelAnchorY
    } = this.props as LabelSeriesProps;
    if (!data) {
      return null;
    }

    if (animation) {
      return (
        <Animation {...this.props} animatedProps={ANIMATED_SERIES_PROPS}>
          <LabelSeries {...this.props} animation={false} _data={data} />
        </Animation>
      );
    }

    const xFunctor = this._getAttributeFunctor('x')!;
    const yFunctor = this._getAttributeFunctor('y')!;

    return (
      <g
        className={getCombinedClassName(predefinedClassName, className)}
        transform={`translate(${marginLeft},${marginTop})`}
        style={style as React.CSSProperties}
      >
        {data.reduce((res: JSX.Element[], d: any, i: number) => {
          const {style: markStyle, xOffset, yOffset} = d;
          if (!getLabel!(d)) {
            return res;
          }
          const xVal = xFunctor(d);
          const yVal = yFunctor(d);
          const leftOfMiddle = xVal < ((xRange![1] - xRange![0]) / 2);
          const aboveMiddle = yVal < Math.abs(yRange![1] - yRange![0]) / 2;

          const x =
            xVal +
            (allowOffsetToBeReversed && leftOfMiddle ? -1 : 1) * (xOffset || 0);
          const y =
            yVal +
            (allowOffsetToBeReversed && aboveMiddle ? -1 : 1) * (yOffset || 0);

          const hasRotationValueSet = d.rotation === 0 || d.rotation;
          const labelRotation = hasRotationValueSet ? d.rotation : rotation;
          const attrs = {
            dominantBaseline: getDominantBaseline(labelAnchorY, aboveMiddle),
            className: 'rv-xy-plot__series--label-text',
            onClick: (e: React.MouseEvent<SVGElement>) => this._valueClickHandler(d, e),
            onContextMenu: (e: React.MouseEvent<SVGElement>) =>
              this._valueRightClickHandler(d, e),
            onMouseOver: (e: React.MouseEvent<SVGElement>) =>
              this._valueMouseOverHandler(d, e),
            onMouseOut: (e: React.MouseEvent<SVGElement>) => this._valueMouseOutHandler(d, e),
            textAnchor: getTextAnchor(labelAnchorX, leftOfMiddle),
            x,
            y,
            transform: `rotate(${labelRotation},${x},${y})`,
            ...markStyle
          };
          const textContent = getLabel!(_data ? _data[i] : d);
          return res.concat([
            <text key={String(i)} {...attrs}>
              {textContent}
            </text>
          ]);
        }, [])}
      </g>
    );
  }
}

(LabelSeries as any).propTypes = {
  animation: PropTypes.bool,
  allowOffsetToBeReversed: PropTypes.bool,
  className: PropTypes.string,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      y: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      angle: PropTypes.number,
      radius: PropTypes.number,
      label: PropTypes.string,
      xOffset: PropTypes.number,
      yOffset: PropTypes.number,
      style: PropTypes.object
    })
  ).isRequired,
  marginLeft: PropTypes.number,
  marginTop: PropTypes.number,
  rotation: PropTypes.number,
  style: PropTypes.object,
  xRange: PropTypes.arrayOf(PropTypes.number),
  yRange: PropTypes.arrayOf(PropTypes.number),
  labelAnchorX: PropTypes.string,
  labelAnchorY: PropTypes.string
};
(LabelSeries as any).defaultProps = {
  ...(AbstractSeries as any).defaultProps,
  animation: false,
  rotation: 0,
  getLabel: (d: any) => d.label
};
(LabelSeries as any).displayName = 'LabelSeries';
export default LabelSeries;
