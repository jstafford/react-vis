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

import {transformValueToString} from 'utils/data-utils';
import {getAttributeFunctor} from 'utils/scales-utils';
import {getCombinedClassName} from 'utils/styling-utils';

const ALIGN = {
  AUTO: 'auto',
  LEFT: 'left',
  RIGHT: 'right',
  LEFT_EDGE: 'leftEdge',
  RIGHT_EDGE: 'rightEdge',
  BOTTOM: 'bottom',
  TOP: 'top',
  BOTTOM_EDGE: 'bottomEdge',
  TOP_EDGE: 'topEdge'
};

const ORIENTATION = {
  BOTTOM_LEFT: 'bottomleft',
  BOTTOM_RIGHT: 'bottomright',
  TOP_LEFT: 'topleft',
  TOP_RIGHT: 'topright'
};

interface AlignShape {
  horizontal: string;
  vertical: string;
}

interface HintProps {
  marginTop?: number;
  marginLeft?: number;
  marginRight?: number;
  marginBottom?: number;
  innerWidth?: number;
  innerHeight?: number;
  scales?: object;
  value?: {[key: string]: any};
  format?: (value: {[key: string]: any}) => Array<{title: any; value: any}>;
  style?: {[key: string]: any};
  className?: string;
  align?: AlignShape;
  getAlignStyle?: (align: AlignShape, x: number, y: number) => React.CSSProperties;
  orientation?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

function defaultFormat(value: {[key: string]: any}) {
  return Object.keys(value).map(function getProp(key) {
    return {title: key, value: transformValueToString(value[key])};
  });
}

const Hint: any = (props: HintProps) => {

  function getAlign(x: number, y: number): AlignShape {
    const {
      innerWidth = 0,
      innerHeight = 0,
      orientation,
      align: alignProp = {horizontal: ALIGN.AUTO, vertical: ALIGN.AUTO}
    } = props;
    const {horizontal, vertical} = alignProp;
    const align: AlignShape = orientation
      ? mapOrientationToAlign(orientation)
      : {horizontal, vertical};
    if (horizontal === ALIGN.AUTO) {
      align.horizontal = x > innerWidth / 2 ? ALIGN.LEFT : ALIGN.RIGHT;
    }
    if (vertical === ALIGN.AUTO) {
      align.vertical = y > innerHeight / 2 ? ALIGN.TOP : ALIGN.BOTTOM;
    }
    return align;
  }

  function getAlignClassNames(align: AlignShape) {
    const {orientation} = props;
    const orientationClass = orientation
      ? `rv-hint--orientation-${orientation}`
      : '';
    return `${orientationClass} rv-hint--horizontalAlign-${align.horizontal}
     rv-hint--verticalAlign-${align.vertical}`;
  }

  function getAlignStyle(align: AlignShape, x: number, y: number): React.CSSProperties {
    return {
      ...getXCSS(align.horizontal, x),
      ...getYCSS(align.vertical, y)
    };
  }

  function getCSSBottom(y: number | null | undefined): React.CSSProperties {
    if (y === undefined || y === null) {
      return {bottom: 0};
    }
    const {innerHeight = 0, marginBottom = 0} = props;
    return {bottom: marginBottom + innerHeight - y};
  }

  function getCSSLeft(x: number | null | undefined): React.CSSProperties {
    if (x === undefined || x === null) {
      return {left: 0};
    }
    const {marginLeft = 0} = props;
    return {left: marginLeft + x};
  }

  function getCSSRight(x: number | null | undefined): React.CSSProperties {
    if (x === undefined || x === null) {
      return {right: 0};
    }
    const {innerWidth = 0, marginRight = 0} = props;
    return {right: marginRight + innerWidth - x};
  }

  function getCSSTop(y: number | null | undefined): React.CSSProperties {
    if (y === undefined || y === null) {
      return {top: 0};
    }
    const {marginTop = 0} = props;
    return {top: marginTop + y};
  }

  function getPositionInfo() {
    const {value = {}, getAlignStyle: customAlignStyle} = props;

    const xFunctor = getAttributeFunctor(props, 'x') as (datum: any) => number;
    const yFunctor = getAttributeFunctor(props, 'y') as (datum: any) => number;
    const x = xFunctor(value);
    const y = yFunctor(value);

    const align = getAlign(x, y);

    return {
      position: customAlignStyle
        ? customAlignStyle(align, x, y)
        : getAlignStyle(align, x, y),
      positionClassName: getAlignClassNames(align)
    };
  }

  function getXCSS(horizontal: string, x: number): React.CSSProperties {
    switch (horizontal) {
      case ALIGN.LEFT_EDGE:
        return getCSSLeft(null);
      case ALIGN.RIGHT_EDGE:
        return getCSSRight(null);
      case ALIGN.LEFT:
        return getCSSRight(x);
      case ALIGN.RIGHT:
      default:
        return getCSSLeft(x);
    }
  }

  function getYCSS(verticalAlign: string, y: number): React.CSSProperties {
    switch (verticalAlign) {
      case ALIGN.TOP_EDGE:
        return getCSSTop(null);
      case ALIGN.BOTTOM_EDGE:
        return getCSSBottom(null);
      case ALIGN.BOTTOM:
        return getCSSTop(y);
      case ALIGN.TOP:
      default:
        return getCSSBottom(y);
    }
  }

  function mapOrientationToAlign(orientation: string): AlignShape {
    switch (orientation) {
      case ORIENTATION.BOTTOM_LEFT:
        return {horizontal: ALIGN.LEFT, vertical: ALIGN.BOTTOM};
      case ORIENTATION.BOTTOM_RIGHT:
        return {horizontal: ALIGN.RIGHT, vertical: ALIGN.BOTTOM};
      case ORIENTATION.TOP_LEFT:
        return {horizontal: ALIGN.LEFT, vertical: ALIGN.TOP};
      case ORIENTATION.TOP_RIGHT:
        return {horizontal: ALIGN.RIGHT, vertical: ALIGN.TOP};
      default:
        return {horizontal: ALIGN.RIGHT, vertical: ALIGN.BOTTOM};
    }
  }

  const {
    value = {},
    format = defaultFormat,
    children,
    style = {},
    className
  } = props;

  const {position, positionClassName} = getPositionInfo();
  return (
    <div
      className={getCombinedClassName(
        'rv-hint',
        positionClassName,
        className
      )}
      style={{
        ...style,
        ...position,
        position: 'absolute'
      }}
    >
      {children ? (
        children
      ) : (
        <div className="rv-hint__content" style={style.content}>
          {format(value).map((formattedProp, i) => (
            <div key={`rv-hint${i}`} style={style.row}>
              <span className="rv-hint__title" style={style.title}>
                {formattedProp.title}
              </span>
              {': '}
              <span className="rv-hint__value" style={style.value}>
                {formattedProp.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

(Hint as any).displayName = 'Hint';
(Hint as any).defaultProps = {
  format: defaultFormat,
  align: {horizontal: ALIGN.AUTO, vertical: ALIGN.AUTO},
  style: {}
};
(Hint as any).propTypes = {
  marginTop: PropTypes.number,
  marginLeft: PropTypes.number,
  innerWidth: PropTypes.number,
  innerHeight: PropTypes.number,
  scales: PropTypes.object,
  value: PropTypes.object,
  format: PropTypes.func,
  style: PropTypes.object,
  className: PropTypes.string,
  align: PropTypes.shape({
    horizontal: PropTypes.oneOf([
      ALIGN.AUTO,
      ALIGN.LEFT,
      ALIGN.RIGHT,
      ALIGN.LEFT_EDGE,
      ALIGN.RIGHT_EDGE
    ]),
    vertical: PropTypes.oneOf([
      ALIGN.AUTO,
      ALIGN.BOTTOM,
      ALIGN.TOP,
      ALIGN.BOTTOM_EDGE,
      ALIGN.TOP_EDGE
    ])
  }),
  getAlignStyle: PropTypes.func,
  orientation: PropTypes.oneOf([
    ORIENTATION.BOTTOM_LEFT,
    ORIENTATION.BOTTOM_RIGHT,
    ORIENTATION.TOP_LEFT,
    ORIENTATION.TOP_RIGHT
  ])
};

 (Hint as any).ORIENTATION = ORIENTATION;
 (Hint as any).ALIGN = ALIGN;

export default Hint;
