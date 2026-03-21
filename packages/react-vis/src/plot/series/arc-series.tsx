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
import {arc as arcBuilder} from 'd3-shape';

import {ANIMATED_SERIES_PROPS} from 'utils/series-utils';
import AbstractSeries, {AbstractSeriesProps} from './abstract-series';
import {
  getAttributeFunctor,
  getAttr0Functor,
  extractScalePropsFromProps,
  getMissingScaleProps,
  getScalePropTypesByAttribute
} from 'utils/scales-utils';
import {getCombinedClassName} from 'utils/styling-utils';

const predefinedClassName = 'rv-xy-plot__series rv-xy-plot__series--arc';
const ATTRIBUTES = ['radius', 'angle'];

export interface ArcSeriesProps extends AbstractSeriesProps<any> {
  center?: {x: number; y: number};
  arcClassName?: string;
  padAngle?: number | ((d: any) => number);
}

interface ArcSeriesState {
  scaleProps: {[key: string]: any};
}

const defaultProps: Partial<ArcSeriesProps> = {
  ...(AbstractSeries as any).defaultProps,
  center: {x: 0, y: 0},
  arcClassName: '',
  className: '',
  style: {},
  padAngle: 0
};

/**
 * Prepare the internal representation of row for real use.
 * This is necessary because d3 insists on starting at 12 oclock and moving
 * clockwise, rather than starting at 3 oclock and moving counter clockwise
 * as one might expect from polar
 * @param {Object} row - coordinate object to be modifed
 * @return {Object} angle corrected object
 */
function modifyRow(row: any): any {
  const {radius, angle, angle0} = row;
  const truedAngle = -1 * angle + Math.PI / 2;
  const truedAngle0 = -1 * angle0 + Math.PI / 2;
  return {
    ...row,
    x: radius * Math.cos(truedAngle),
    y: radius * Math.sin(truedAngle),
    angle: truedAngle,
    angle0: truedAngle0
  };
}

class ArcSeries extends AbstractSeries<any> {
  state: ArcSeriesState;

  constructor(props: ArcSeriesProps) {
    super(props);
    const scaleProps = this._getAllScaleProps(props);
    this.state = {scaleProps};
  }

  UNSAFE_componentWillReceiveProps(nextProps: ArcSeriesProps): void {
    this.setState({scaleProps: this._getAllScaleProps(nextProps)});
  }

  /**
   * Get the map of scales from the props.
   * @param {Object} props Props.
   * @param {Array} data Array of all data.
   * @returns {Object} Map of scales.
   * @private
   */
  _getAllScaleProps(props: ArcSeriesProps): {[key: string]: any} {
    const defaultScaleProps = this._getDefaultScaleProps(props);
    const userScaleProps = extractScalePropsFromProps(props, ATTRIBUTES);
    const missingScaleProps = getMissingScaleProps(
      {
        ...defaultScaleProps,
        ...userScaleProps
      },
      props.data || [],
      ATTRIBUTES
    );

    return {
      ...defaultScaleProps,
      ...userScaleProps,
      ...missingScaleProps
    };
  }

  /**
   * Get the list of scale-related settings that should be applied by default.
   * @param {Object} props Object of props.
   * @returns {Object} Defaults.
   * @private
   */
  _getDefaultScaleProps(props: ArcSeriesProps): {[key: string]: any} {
    const {innerWidth, innerHeight} = props;
    const radius = Math.min((innerWidth ?? 0) / 2, (innerHeight ?? 0) / 2);
    return {
      radiusRange: [0, radius],
      _radiusValue: radius,
      angleType: 'literal'
    };
  }

  render(): JSX.Element | null {
    const {
      arcClassName,
      animation,
      className,
      center,
      data,
      disableSeries,
      hideSeries,
      marginLeft,
      marginTop,
      padAngle,
      style
    } = this.props as ArcSeriesProps;

    if (!data) {
      return null;
    }

    if (animation) {
      const cloneData = data.map((d: any) => ({...d}));
      return (
        <g className="rv-xy-plot__series--arc__animation-wrapper">
          <Animation
            {...this.props}
            animatedProps={ANIMATED_SERIES_PROPS}
            data={cloneData}
          >
            <ArcSeries
              {...this.props}
              animation={false}
              disableSeries={true}
              data={cloneData}
            />
          </Animation>
          <ArcSeries
            {...this.props}
            animation={false}
            hideSeries
            style={{stroke: 'red'}}
          />
        </g>
      );
    }

    const {scaleProps} = this.state;
    const {radiusDomain} = scaleProps;
    // need to generate our own functors as abstract series doesnt have anything for us
    const radius = getAttributeFunctor(scaleProps, 'radius')!;
    const radius0 = getAttr0Functor(scaleProps, 'radius')!;
    const angle = getAttributeFunctor(scaleProps, 'angle')!;
    const angle0 = getAttr0Functor(scaleProps, 'angle')!;
    // but it does have good color support!
    const fill =
      this._getAttributeFunctor('fill') || this._getAttributeFunctor('color');
    const stroke =
      this._getAttributeFunctor('stroke') || this._getAttributeFunctor('color');
    const opacity = this._getAttributeFunctor('opacity');
    const x = this._getAttributeFunctor('x')!;
    const y = this._getAttributeFunctor('y')!;

    return (
      <g
        className={getCombinedClassName(predefinedClassName, className)}
        onMouseOver={this._seriesMouseOverHandler}
        onMouseOut={this._seriesMouseOutHandler}
        onClick={this._seriesClickHandler}
        onContextMenu={this._seriesRightClickHandler}
        opacity={hideSeries ? 0 : 1}
        pointerEvents={disableSeries ? 'none' : 'all'}
        transform={`translate(${(marginLeft ?? 0) + x(center)},${(marginTop ?? 0) +
          y(center)})`}
      >
        {data.map((row: any, i: number) => {
          const noRadius = radiusDomain[1] === radiusDomain[0];
          const arcArg = {
            innerRadius: noRadius ? 0 : radius0(row),
            outerRadius: radius(row),
            startAngle: angle0(row) || 0,
            endAngle: angle(row)
          };
          const arcedData = arcBuilder().padAngle(padAngle as number);
          const rowStyle = row.style || {};
          const rowClassName = row.className || '';
          return (
            <path
              key={`path-${i}`}
              style={{
                opacity: opacity && opacity(row),
                stroke: stroke && stroke(row),
                fill: fill && fill(row),
                ...(style as React.CSSProperties),
                ...rowStyle
              }}
              onClick={e => this._valueClickHandler(modifyRow(row), e)}
              onContextMenu={e =>
                this._valueRightClickHandler(modifyRow(row), e)
              }
              onMouseOver={e => this._valueMouseOverHandler(modifyRow(row), e)}
              onMouseOut={e => this._valueMouseOutHandler(modifyRow(row), e)}
              className={`${predefinedClassName}-path ${arcClassName} ${rowClassName}`}
              d={arcedData(arcArg) ?? undefined}
            />
          );
        })}
      </g>
    );
  }
}

(ArcSeries as any).propTypes = {
  ...(AbstractSeries as any).propTypes,
  ...getScalePropTypesByAttribute('radius'),
  ...getScalePropTypesByAttribute('angle'),
  center: PropTypes.shape({
    x: PropTypes.number,
    y: PropTypes.number
  }),
  arcClassName: PropTypes.string,
  padAngle: PropTypes.oneOfType([PropTypes.func, PropTypes.number])
};
(ArcSeries as any).defaultProps = defaultProps;
(ArcSeries as any).displayName = 'ArcSeries';

export default ArcSeries;
