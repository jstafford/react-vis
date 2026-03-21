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

import {ORIENTATION, getTickValues} from 'utils/axis-utils';
import {getAttributeScale} from 'utils/scales-utils';

const {LEFT, RIGHT, TOP, BOTTOM} = ORIENTATION;

export interface AxisTicksStyle {
  line?: React.CSSProperties | {[key: string]: any};
  text?: React.CSSProperties | {[key: string]: any};
  [key: string]: any;
}

export interface AxisTicksProps {
  attr: string;
  height: number;
  orientation: string;
  style?: AxisTicksStyle;
  width: number;
  tickFormat?: (d: any, i: number, scale: any, tickTotal: number) => any;
  tickLabelAngle?: number;
  tickPadding?: number;
  tickSize?: number;
  tickSizeInner?: number;
  tickSizeOuter?: number;
  tickTotal?: number;
  tickValues?: any[];
  [key: string]: any;
}

const propTypes = {
  height: PropTypes.number.isRequired,
  orientation: PropTypes.oneOf([LEFT, RIGHT, TOP, BOTTOM]).isRequired,
  style: PropTypes.object,
  width: PropTypes.number.isRequired
};

const defaultProps = {
  style: {}
};

function _getTickFormatFn(
  scale: any,
  tickTotal: number | undefined,
  tickFormat: AxisTicksProps['tickFormat']
) {
  return !tickFormat
    ? scale.tickFormat
      ? scale.tickFormat(tickTotal)
      : (v: any) => v
    : tickFormat;
}

class AxisTicks extends React.Component<AxisTicksProps> {
  static defaultProps = defaultProps;
  static displayName = 'AxisTicks';
  static propTypes = propTypes;
  static requiresSVG = true;

  /**
   * Check if axis ticks should be mirrored (for the right and top positions.
   * @returns {boolean} True if mirrored.
   * @private
   */
  _areTicksWrapped(): boolean {
    const {orientation} = this.props;
    return orientation === LEFT || orientation === TOP;
  }

  _getTickContainerPropsGetterFn(): (pos: number, offset?: number) => {transform: string} {
    if (this._isAxisVertical()) {
      return pos => {
        return {transform: `translate(0, ${pos})`};
      };
    }
    return pos => {
      return {transform: `translate(${pos}, 0)`};
    };
  }

  /**
   * Get attributes for the label of the tick.
   * @returns {Object} Object with properties.
   * @private
   */
  _getTickLabelProps(): {textAnchor: string; dy: string; transform: string} {
    const {
      orientation,
      tickLabelAngle,
      tickSize,
      tickSizeOuter = tickSize,
      tickPadding = tickSize
    } = this.props;

    // Assign the text orientation inside the label of the tick mark.
    let textAnchor: string;
    if (orientation === LEFT || (orientation === BOTTOM && tickLabelAngle)) {
      textAnchor = 'end';
    } else if (
      orientation === RIGHT ||
      (orientation === TOP && tickLabelAngle)
    ) {
      textAnchor = 'start';
    } else {
      textAnchor = 'middle';
    }

    // The label's position is translated to the given padding and then the
    // label is rotated to the given angle.
    const isVertical = this._isAxisVertical();
    const wrap = this._areTicksWrapped() ? -1 : 1;

    const labelOffset = wrap * ((tickSizeOuter as number) + (tickPadding as number));
    const transform =
      (isVertical
        ? `translate(${labelOffset}, 0)`
        : `translate(0, ${labelOffset})`) +
      (tickLabelAngle ? ` rotate(${tickLabelAngle})` : '');

    // Set the vertical offset of the label according to the position of
    // the axis.
    const dy =
      orientation === TOP || tickLabelAngle
        ? '0'
        : orientation === BOTTOM
        ? '0.72em'
        : '0.32em';

    return {
      textAnchor,
      dy,
      transform
    };
  }

  /**
   * Get the props of the tick line.
   * @returns {Object} Props.
   * @private
   */
  _getTickLineProps(): {[key: string]: number} {
    const {
      tickSize,
      tickSizeOuter = tickSize,
      tickSizeInner = tickSize
    } = this.props;
    const isVertical = this._isAxisVertical();
    const tickXAttr = isVertical ? 'y' : 'x';
    const tickYAttr = isVertical ? 'x' : 'y';
    const wrap = this._areTicksWrapped() ? -1 : 1;
    return {
      [`${tickXAttr}1`]: 0,
      [`${tickXAttr}2`]: 0,
      [`${tickYAttr}1`]: -wrap * (tickSizeInner as number),
      [`${tickYAttr}2`]: wrap * (tickSizeOuter as number)
    };
  }

  /**
   * Gets if the axis is vertical.
   * @returns {boolean} True if vertical.
   * @private
   */
  _isAxisVertical(): boolean {
    const {orientation} = this.props;
    return orientation === LEFT || orientation === RIGHT;
  }

  render() {
    const {
      attr,
      orientation,
      width,
      height,
      style,
      tickFormat,
      tickTotal,
      tickValues
    } = this.props;

    const x = orientation === LEFT ? width : 0;
    const y = orientation === TOP ? height : 0;

    const scale = getAttributeScale(this.props, attr);

    const values = getTickValues(scale, tickTotal as number, tickValues);
    const tickFormatFn = _getTickFormatFn(scale, tickTotal, tickFormat);

    const translateFn = this._getTickContainerPropsGetterFn();
    const pathProps = this._getTickLineProps();
    const textProps = this._getTickLabelProps();

    const ticks = values.map((v, i) => {
      const pos = scale(v);
      const labelNode = tickFormatFn(v, i, scale, tickTotal);
      const shouldRenderAsOwnNode =
        React.isValidElement(labelNode) &&
        !['tspan', 'textPath'].includes((labelNode as React.ReactElement).type as string);
      const shouldAddProps = labelNode && typeof (labelNode as React.ReactElement).type !== 'string';
      return (
        <g
          key={i}
          {...translateFn(pos, 0)}
          className="rv-xy-plot__axis__tick"
          style={style as any}
        >
          <line
            {...(pathProps as any)}
            className="rv-xy-plot__axis__tick__line"
            style={{...(style as any), ...(style as any).line}}
          />
          {shouldRenderAsOwnNode ? (
            React.cloneElement(
              labelNode as React.ReactElement,
              shouldAddProps
                ? {
                    ...textProps,
                    containerWidth: width,
                    tickCount: values.length
                  }
                : undefined
            )
          ) : (
            <text
              {...(textProps as any)}
              className="rv-xy-plot__axis__tick__text"
              style={{...(style as any), ...(style as any).text}}
            >
              {labelNode}
            </text>
          )}
        </g>
      );
    });

    return (
      <g
        transform={`translate(${x}, ${y})`}
        className="rv-xy-plot__axis__ticks"
      >
        {ticks}
      </g>
    );
  }
}

export default AxisTicks;
