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

import Animation, {AnimationParam, AnimationPropType} from 'animation';
import {ORIENTATION, getTicksTotalFromSize} from 'utils/axis-utils';
import {getAttributeScale} from 'utils/scales-utils';
import {getCombinedClassName} from 'utils/styling-utils';

import AxisLine from './axis-line';
import AxisTicks from './axis-ticks';
import AxisTitle from './axis-title';

const defaultAnimatedProps = [
  'xRange',
  'yRange',
  'xDomain',
  'yDomain',
  'width',
  'height',
  'marginLeft',
  'marginTop',
  'marginRight',
  'marginBottom',
  'tickSize',
  'tickTotal',
  'tickSizeInner',
  'tickSizeOuter'
];

const {LEFT, RIGHT, TOP, BOTTOM} = ORIENTATION;

export interface AxisProps {
  orientation?: string;
  attr: string;
  attrAxis?: string;
  width?: number;
  height?: number;
  top?: number;
  left?: number;
  title?: string;
  style?: React.CSSProperties | {[key: string]: any};
  className?: string;
  hideTicks?: boolean;
  hideLine?: boolean;
  on0?: boolean;
  tickLabelAngle?: number;
  tickSize?: number;
  tickSizeInner?: number;
  tickSizeOuter?: number;
  tickPadding?: number;
  tickValues?: Array<number | string>;
  tickFormat?: (d: any) => string | number;
  tickTotal?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  innerWidth?: number;
  innerHeight?: number;
  animation?: AnimationParam;
  position?: string;
  [key: string]: any;
}

const propTypes = {
  orientation: PropTypes.oneOf([LEFT, RIGHT, TOP, BOTTOM]),
  attr: PropTypes.string.isRequired,
  attrAxis: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  top: PropTypes.number,
  left: PropTypes.number,
  title: PropTypes.string,
  style: PropTypes.object,
  className: PropTypes.string,
  hideTicks: PropTypes.bool,
  hideLine: PropTypes.bool,
  on0: PropTypes.bool,
  tickLabelAngle: PropTypes.number,
  tickSize: PropTypes.number,
  tickSizeInner: PropTypes.number,
  tickSizeOuter: PropTypes.number,
  tickPadding: PropTypes.number,
  tickValues: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string])
  ),
  tickFormat: PropTypes.func,
  tickTotal: PropTypes.number,
  marginTop: PropTypes.number,
  marginBottom: PropTypes.number,
  marginLeft: PropTypes.number,
  marginRight: PropTypes.number,
  innerWidth: PropTypes.number,
  innerHeight: PropTypes.number
};

const defaultProps = {
  className: '',
  on0: false,
  style: {},
  tickSize: 6,
  tickPadding: 8,
  orientation: BOTTOM
};

const predefinedClassName = 'rv-xy-plot__axis';
const VERTICAL_CLASS_NAME = 'rv-xy-plot__axis--vertical';
const HORIZONTAL_CLASS_NAME = 'rv-xy-plot__axis--horizontal';

function getDefaultAxisProps(props: AxisProps) {
    const {
      innerWidth,
      innerHeight,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      orientation
    } = props;
    if (orientation === BOTTOM) {
      return {
        tickTotal: getTicksTotalFromSize(innerWidth!),
        top: innerHeight! + marginTop!,
        left: marginLeft,
        width: innerWidth,
        height: marginBottom
      };
    } else if (orientation === TOP) {
      return {
        tickTotal: getTicksTotalFromSize(innerWidth!),
        top: 0,
        left: marginLeft,
        width: innerWidth,
        height: marginTop
      };
    } else if (orientation === LEFT) {
      return {
        tickTotal: getTicksTotalFromSize(innerHeight!),
        top: marginTop,
        left: 0,
        width: marginLeft,
        height: innerHeight
      };
    }
    return {
      tickTotal: getTicksTotalFromSize(innerHeight!),
      top: marginTop,
      left: marginLeft! + innerWidth!,
      width: marginRight,
      height: innerHeight
    };
}

const Axis: any = (props: AxisProps) => {
    const {animation} = props;

    if (animation) {
      const animatedProps = (animation as any).nonAnimatedProps
        ? defaultAnimatedProps.filter(
            prop => (animation as any).nonAnimatedProps.indexOf(prop) < 0
          )
        : defaultAnimatedProps;

      return (
        <Animation {...props} {...{animatedProps}}>
          <Axis {...props} animation={null as any} />
        </Animation>
      );
    }

    const mergedProps = {
      ...getDefaultAxisProps(props),
      ...props
    };

    const {
      attrAxis,
      className,
      height,
      hideLine,
      hideTicks,
      left,
      marginTop,
      on0,
      orientation,
      position,
      style,
      title,
      top,
      width
    } = mergedProps;
    const isVertical = [LEFT, RIGHT].indexOf(orientation!) > -1;
    const axisClassName = isVertical
      ? VERTICAL_CLASS_NAME
      : HORIZONTAL_CLASS_NAME;

    let leftPos = left;
    let topPos = top;
    if (on0) {
      const scale = getAttributeScale(mergedProps, attrAxis!);
      if (isVertical) {
        leftPos = scale(0);
      } else {
        topPos = marginTop! + scale(0);
      }
    }

    return (
      <g
        transform={`translate(${leftPos},${topPos})`}
        className={getCombinedClassName(
          predefinedClassName,
          axisClassName,
          className
        )}
        style={style}
      >
        {!hideLine && (
          <AxisLine
            height={height!}
            width={width!}
            orientation={orientation!}
            style={{...style, ...(style as any).line}}
          />
        )}
        {!hideTicks && (
          <AxisTicks {...(mergedProps as any)} style={{...style, ...(style as any).ticks}} />
        )}
        {title ? (
          <AxisTitle
            position={position as 'start' | 'middle' | 'end' | undefined}
            title={title}
            height={height!}
            width={width!}
            style={{...style, ...(style as any).title}}
            orientation={orientation!}
          />
        ) : null}
      </g>
    );
  };

(Axis as any).displayName = 'Axis';
(Axis as any).propTypes = propTypes;
(Axis as any).defaultProps = defaultProps;
(Axis as any).requiresSVG = true;

export default Axis;
