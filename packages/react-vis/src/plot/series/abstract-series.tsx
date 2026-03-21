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

import PropTypes from 'prop-types';
import {voronoi} from 'd3-voronoi';
import {PureComponent} from 'react';
import React from 'react';

import {AnimationPropType, AnimationParam} from 'animation';
import {
  getAttributeFunctor,
  getAttr0Functor,
  getAttributeValue,
  getScaleObjectFromProps,
  getScalePropTypesByAttribute
} from 'utils/scales-utils';

export type RVDatum = {[key: string]: any};

export type RVEventHandler<T = RVDatum> = (
  value: T,
  info: {event: Event}
) => void;

export type RVSeriesEventHandler = (info: {event: Event}) => void;

export type RVNearestXHandler<T = RVDatum> = (
  value: T,
  info: {innerX: number; index: number; event: Event}
) => void;

export type RVNearestXYHandler<T = RVDatum> = (
  value: T,
  info: {innerX: number; innerY: number; index: number; event: Event}
) => void;

export interface AbstractSeriesProps<T extends RVDatum = RVDatum> {
  width?: number;
  height?: number;
  data?: T[];
  onValueMouseOver?: RVEventHandler<T>;
  onValueMouseOut?: RVEventHandler<T>;
  onValueClick?: RVEventHandler<T>;
  onValueRightClick?: RVEventHandler<T>;
  onSeriesMouseOver?: RVSeriesEventHandler;
  onSeriesMouseOut?: RVSeriesEventHandler;
  onSeriesClick?: RVSeriesEventHandler;
  onSeriesRightClick?: RVSeriesEventHandler;
  onNearestX?: RVNearestXHandler<T>;
  onNearestXY?: RVNearestXYHandler<T>;
  style?: React.CSSProperties;
  animation?: AnimationParam;
  stack?: boolean;
  className?: string;
  marginTop?: number;
  marginLeft?: number;
  [key: string]: any;
}

const propTypes = {
  ...getScalePropTypesByAttribute('x'),
  ...getScalePropTypesByAttribute('y'),
  ...getScalePropTypesByAttribute('size'),
  ...getScalePropTypesByAttribute('opacity'),
  ...getScalePropTypesByAttribute('color'),
  width: PropTypes.number,
  height: PropTypes.number,
  data: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.object, PropTypes.array])
  ),
  onValueMouseOver: PropTypes.func,
  onValueMouseOut: PropTypes.func,
  onValueClick: PropTypes.func,
  onValueRightClick: PropTypes.func,
  onSeriesMouseOver: PropTypes.func,
  onSeriesMouseOut: PropTypes.func,
  onSeriesClick: PropTypes.func,
  onSeriesRightClick: PropTypes.func,
  onNearestX: PropTypes.func,
  onNearestXY: PropTypes.func,
  style: PropTypes.object,
  animation: AnimationPropType,
  stack: PropTypes.bool
};

const defaultProps = {
  className: '',
  stack: false,
  style: {}
};

class AbstractSeries<
  T extends RVDatum = RVDatum
> extends PureComponent<AbstractSeriesProps<T>> {
  /**
   * Get a default config for the parent.
   * @returns {Object} Empty config.
   */
  static getParentConfig(attr?: string): Record<string, unknown> {
    return {};
  }

  /**
   * Tells the rest of the world that it requires SVG to work.
   * @returns {boolean} Result.
   */
  static get requiresSVG(): boolean {
    return true;
  }

  onParentMouseMove(event: React.SyntheticEvent<SVGElement>): void {
    const {onNearestX, onNearestXY, data} = this.props;
    if ((!onNearestX && !onNearestXY) || !data) {
      return;
    }
    if (onNearestXY) {
      this._handleNearestXY(event);
    } else {
      this._handleNearestX(event);
    }
  }

  onParentTouchMove(e: React.TouchEvent<SVGElement>): void {
    e.preventDefault();
    this.onParentMouseMove(e as any);
  }

  onParentTouchStart(e: React.TouchEvent<SVGElement>): void {
    // prevent mouse event emulation
    e.preventDefault();
  }

  /**
   * Get the attr0 functor.
   * @param {string} attr Attribute name.
   * @returns {*} Functor.
   * @private
   */
  _getAttr0Functor(attr: string): ((d: T) => any) | null {
    return getAttr0Functor(this.props, attr);
  }

  /**
   * Get attribute functor.
   * @param {string} attr Attribute name
   * @returns {*} Functor.
   * @protected
   */
  _getAttributeFunctor(attr: string): ((d: T) => any) | null {
    return getAttributeFunctor(this.props, attr);
  }

  /**
   * Get the attribute value if it is available.
   * @param {string} attr Attribute name.
   * @returns {*} Attribute value if available, fallback value or undefined
   * otherwise.
   * @protected
   */
  _getAttributeValue(attr: string): any {
    return getAttributeValue(this.props, attr);
  }

  /**
   * Get the scale object distance by the attribute from the list of properties.
   * @param {string} attr Attribute name.
   * @returns {number} Scale distance.
   * @protected
   */
  _getScaleDistance(attr: string): number {
    const scaleObject = getScaleObjectFromProps(this.props, attr);
    return scaleObject ? scaleObject.distance : 0;
  }

  _getXYCoordinateInContainer(
    event: React.SyntheticEvent<SVGElement>
  ): {x: number; y: number} {
    const {marginTop = 0, marginLeft = 0} = this.props;
    const {nativeEvent: evt, currentTarget} = event as any;
    const rect = (currentTarget as Element).getBoundingClientRect();
    let x = evt.clientX;
    let y = evt.clientY;
    if (evt.type === 'touchmove') {
      x = evt.touches[0].pageX;
      y = evt.touches[0].pageY;
    }
    return {
      x: x - rect.left - (currentTarget as Element).clientLeft - marginLeft,
      y: y - rect.top - (currentTarget as Element).clientTop - marginTop
    };
  }

  _handleNearestX(event: React.SyntheticEvent<SVGElement>): void {
    const {onNearestX, data} = this.props;
    let minDistance = Number.POSITIVE_INFINITY;
    let value: T | null = null;
    let valueIndex: number | null = null;

    const coordinate = this._getXYCoordinateInContainer(event);
    const xScaleFn = this._getAttributeFunctor('x');

    if (!xScaleFn || !data) {
      return;
    }

    data.forEach((item, i) => {
      const currentCoordinate = xScaleFn(item);
      const newDistance = Math.abs(coordinate.x - currentCoordinate);
      if (newDistance < minDistance) {
        minDistance = newDistance;
        value = item;
        valueIndex = i;
      }
    });
    if (!value) {
      return;
    }
    onNearestX!(value, {
      innerX: xScaleFn(value),
      index: valueIndex!,
      event: (event as any).nativeEvent
    });
  }

  _handleNearestXY(event: React.SyntheticEvent<SVGElement>): void {
    const {onNearestXY, data} = this.props;

    if (!data) {
      return;
    }

    const coordinate = this._getXYCoordinateInContainer(event);
    const xScaleFn = this._getAttributeFunctor('x');
    const yScaleFn = this._getAttributeFunctor('y');

    if (!xScaleFn || !yScaleFn) {
      return;
    }

    // Create a voronoi with each node center points
    const voronoiInstance = voronoi<T>()
      .x(xScaleFn)
      .y(yScaleFn);

    const foundPoint = voronoiInstance(data).find(coordinate.x, coordinate.y);
    if (!foundPoint) {
      return;
    }
    const value = foundPoint.data;

    if (!value) {
      return;
    }
    onNearestXY!(value, {
      innerX: foundPoint[0],
      innerY: foundPoint[1],
      index: foundPoint.index,
      event: (event as any).nativeEvent
    });
  }

  /**
   * Click handler for the entire series.
   * @param {Object} event Event.
   * @protected
   */
  _seriesClickHandler = (event: React.MouseEvent<SVGElement>): void => {
    const {onSeriesClick} = this.props;
    if (onSeriesClick) {
      onSeriesClick({event: event.nativeEvent});
    }
  };

  /**
   * Mouse out handler for the entire series.
   * @param {Object} event Event.
   * @protected
   */
  _seriesMouseOutHandler = (event: React.MouseEvent<SVGElement>): void => {
    const {onSeriesMouseOut} = this.props;
    if (onSeriesMouseOut) {
      onSeriesMouseOut({event: event.nativeEvent});
    }
  };

  /**
   * Mouse over handler for the entire series.
   * @param {Object} event Event.
   * @protected
   */
  _seriesMouseOverHandler = (event: React.MouseEvent<SVGElement>): void => {
    const {onSeriesMouseOver} = this.props;
    if (onSeriesMouseOver) {
      onSeriesMouseOver({event: event.nativeEvent});
    }
  };

  /**
   * Right Click handler for the entire series.
   * @param {Object} event Event.
   * @protected
   */
  _seriesRightClickHandler = (event: React.MouseEvent<SVGElement>): void => {
    const {onSeriesRightClick} = this.props;
    if (onSeriesRightClick) {
      onSeriesRightClick({event: event.nativeEvent});
    }
  };

  /**
   * Click handler for the specific series' value.
   * @param {Object} d Value object
   * @param {Object} event Event.
   * @protected
   */
  _valueClickHandler = (d: T, event: React.MouseEvent<SVGElement>): void => {
    const {onValueClick, onSeriesClick} = this.props;
    if (onValueClick) {
      onValueClick(d, {event: event.nativeEvent});
    }
    if (onSeriesClick) {
      onSeriesClick({event: event.nativeEvent});
    }
  };

  /**
   * Mouse out handler for the specific series' value.
   * @param {Object} d Value object
   * @param {Object} event Event.
   * @protected
   */
  _valueMouseOutHandler = (d: T, event: React.MouseEvent<SVGElement>): void => {
    const {onValueMouseOut, onSeriesMouseOut} = this.props;
    if (onValueMouseOut) {
      onValueMouseOut(d, {event: event.nativeEvent});
    }
    if (onSeriesMouseOut) {
      onSeriesMouseOut({event: event.nativeEvent});
    }
  };

  /**
   * Mouse over handler for the specific series' value.
   * @param {Object} d Value object
   * @param {Object} event Event.
   * @protected
   */
  _valueMouseOverHandler = (
    d: T,
    event: React.MouseEvent<SVGElement>
  ): void => {
    const {onValueMouseOver, onSeriesMouseOver} = this.props;
    if (onValueMouseOver) {
      onValueMouseOver(d, {event: event.nativeEvent});
    }
    if (onSeriesMouseOver) {
      onSeriesMouseOver({event: event.nativeEvent});
    }
  };

  /**
   * Right Click handler for the specific series' value.
   * @param {Object} d Value object
   * @param {Object} event Event.
   * @protected
   */
  _valueRightClickHandler = (
    d: T,
    event: React.MouseEvent<SVGElement>
  ): void => {
    const {onValueRightClick, onSeriesRightClick} = this.props;
    if (onValueRightClick) {
      onValueRightClick(d, {event: event.nativeEvent});
    }
    if (onSeriesRightClick) {
      onSeriesRightClick({event: event.nativeEvent});
    }
  };

  render(): React.ReactNode {
    return null;
  }
}

(AbstractSeries as any).displayName = 'AbstractSeries';
(AbstractSeries as any).propTypes = propTypes;
(AbstractSeries as any).defaultProps = defaultProps;

export default AbstractSeries;
