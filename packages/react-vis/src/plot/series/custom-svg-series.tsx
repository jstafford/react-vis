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
import {useAbstractSeries} from './abstract-series-hook';
import Animation from 'animation';
import {ANIMATED_SERIES_PROPS} from 'utils/series-utils';
import {getCombinedClassName} from 'utils/styling-utils';

const predefinedClassName =
  'rv-xy-plot__series rv-xy-plot__series--custom-svg-wrapper';

const DEFAULT_STYLE: React.CSSProperties = {
  stroke: 'blue',
  fill: 'blue'
};

export interface CustomSVGSeriesProps extends AbstractSeriesProps<any> {
  customComponent?: string | ((d: any, pos: any, style: any, funcs: any) => JSX.Element);
  size?: number;
}

function predefinedComponents(
  type: string,
  size: number = 2,
  style: React.CSSProperties = DEFAULT_STYLE
): JSX.Element {
  switch (type) {
    case 'diamond':
      return (
        <polygon
          style={style}
          points={`0 0 ${size / 2} ${size / 2} 0 ${size} ${-size / 2} ${size /
            2} 0 0`}
        />
      );
    case 'star': {
      const starPoints = [...new Array(5)]
        .map((c, index) => {
          const angle = (index / 5) * Math.PI * 2;
          const innerAngle = angle + Math.PI / 10;
          const outerAngle = angle - Math.PI / 10;
          // ratio of inner polygon to outer polgyon
          const innerRadius = size / 2.61;
          return `
        ${Math.cos(outerAngle) * size} ${Math.sin(outerAngle) * size}
        ${Math.cos(innerAngle) * innerRadius} ${Math.sin(innerAngle) *
            innerRadius}
      `;
        })
        .join(' ');
      return (
        <polygon
          points={starPoints}
          x="0"
          y="0"
          height={size}
          width={size}
          style={style}
        />
      );
    }
    case 'square':
      return (
        <rect
          x={`${-size / 2}`}
          y={`${-size / 2}`}
          height={size}
          width={size}
          style={style}
        />
      );
    default:
    case 'circle':
      return <circle cx="0" cy="0" r={size / 2} style={style} />;
  }
}

function getInnerComponent({
  customComponent,
  defaultType,
  positionInPixels,
  positionFunctions,
  style,
  propsSize
}: {
  customComponent: any;
  defaultType: string | ((d: any, pos: any, style: any, funcs: any) => JSX.Element);
  positionInPixels: {x: number; y: number};
  positionFunctions: {x: any; y: any};
  style: React.CSSProperties | {[key: string]: any};
  propsSize: number;
}): JSX.Element {
  const {size} = customComponent;
  const aggStyle = {...style, ...(customComponent.style || {})};
  const innerComponent = customComponent.customComponent;
  if (!innerComponent && typeof defaultType === 'string') {
    return predefinedComponents(defaultType as string, size || propsSize, aggStyle);
  }
  // if default component is a function
  if (!innerComponent) {
    return (defaultType as Function)(
      customComponent,
      positionInPixels,
      aggStyle,
      positionFunctions
    );
  }
  if (typeof innerComponent === 'string') {
    return predefinedComponents((innerComponent || defaultType) as string, size, aggStyle);
  }
  // if inner component is a function
  return innerComponent(
    customComponent,
    positionInPixels,
    aggStyle,
    positionFunctions
  );
}

function CustomSVGSeries(props: CustomSVGSeriesProps): JSX.Element | null {
  const {
    animation, className, customComponent, data,
    marginLeft, marginTop, style, size, getAttributeFunctor,
    onValueMouseOverHandler, onValueMouseOutHandler
  } = {...props, ...useAbstractSeries(props)};

    if (!data || !props.innerWidth || !props.innerHeight) {
      return null;
    }

    if (animation) {
      return (
        <Animation {...props} animatedProps={ANIMATED_SERIES_PROPS}>
          <CustomSVGSeries {...props} animation={false} />
        </Animation>
      );
    }

    const x = getAttributeFunctor('x')!;
    const y = getAttributeFunctor('y')!;
    const contents = data.map((seriesComponent: any, index: number) => {
      const positionInPixels = {
        x: x(seriesComponent),
        y: y(seriesComponent)
      };
      const innerComponent = getInnerComponent({
        customComponent: seriesComponent,
        positionInPixels,
        defaultType: customComponent as any,
        positionFunctions: {x, y},
        style: style as React.CSSProperties,
        propsSize: size ?? 2
      });
      return (
        <g
          className="rv-xy-plot__series--custom-svg"
          key={`rv-xy-plot__series--custom-svg-${index}`}
          transform={`translate(${positionInPixels.x},${positionInPixels.y})`}
          onMouseEnter={e => onValueMouseOverHandler?.(seriesComponent, e)}
          onMouseLeave={e => onValueMouseOutHandler?.(seriesComponent, e)}
        >
          {innerComponent}
        </g>
      );
    });
    return (
      <g
        className={getCombinedClassName(predefinedClassName, className)}
        transform={`translate(${marginLeft},${marginTop})`}
      >
        {contents}
      </g>
    );
  }

(CustomSVGSeries as any).propTypes = {
  animation: PropTypes.bool,
  className: PropTypes.string,
  customComponent: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  data: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      y: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
    })
  ).isRequired,
  marginLeft: PropTypes.number,
  marginTop: PropTypes.number,
  style: PropTypes.object,
  size: PropTypes.number,
  onValueMouseOver: PropTypes.func,
  onValueMouseOut: PropTypes.func
};

(CustomSVGSeries as any).defaultProps = {
  ...(AbstractSeries as any).defaultProps,
  animation: false,
  customComponent: 'circle',
  style: {},
  size: 2
};

export default CustomSVGSeries;
