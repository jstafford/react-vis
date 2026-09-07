import {voronoi} from 'd3-voronoi';
import {useCallback} from 'react';
import React from 'react';

import {AnimationParam} from 'animation';
import {
  getAttr0Functor,
  getAttributeFunctor,
  getAttributeValue,
  getScaleObjectFromProps
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

const defaultProps = {
  className: '',
  stack: false,
  style: {}
};


export function useAbstractSeries<T extends RVDatum = RVDatum>(
  props: AbstractSeriesProps<T>
) {
  const {
    data,
    marginTop = 0,
    marginLeft = 0,
    onNearestX,
    onNearestXY,
    ...callbacks
  } = props;

  const getAttributeFunctorFor = useCallback(
    (attr: string) => getAttributeFunctor(props, attr),
    [props]
  );

  const getAttr0FunctorFor = useCallback(
    (attr: string) => getAttr0Functor(props, attr),
    [props]
  );

  const getAttributeValueFor = useCallback(
    (attr: string) => getAttributeValue(props, attr),
    [props]
  );

  const getScaleDistance = useCallback(
    (attr: string) => getScaleObjectFromProps(props, attr)?.distance || 0,
    [props]
  );

  const getXYCoordinateInContainer = useCallback(
    (event: React.SyntheticEvent<SVGElement>) => {
      const {nativeEvent: nativeEvent, currentTarget} = event as any;
      const rect = (currentTarget as Element).getBoundingClientRect();
      let x = nativeEvent.clientX;
      let y = nativeEvent.clientY;
      if (nativeEvent.type === 'touchmove') {
        x = nativeEvent.touches[0].pageX;
        y = nativeEvent.touches[0].pageY;
      }
      return {
        x: x - rect.left - (currentTarget as Element).clientLeft - marginLeft,
        y: y - rect.top - (currentTarget as Element).clientTop - marginTop
      };
    },
    [marginLeft, marginTop]
  );

  const handleNearestX = useCallback(
    (event: React.SyntheticEvent<SVGElement>) => {
      if (!onNearestX || !data) return;
      const xScaleFn = getAttributeFunctorFor('x');
      if (!xScaleFn) return;

      const coordinate = getXYCoordinateInContainer(event);
      let minDistance = Number.POSITIVE_INFINITY;
      let value: T | null = null;
      let valueIndex: number | null = null;
      data.forEach((item, index) => {
        const distance = Math.abs(coordinate.x - xScaleFn(item));
        if (distance < minDistance) {
          minDistance = distance;
          value = item;
          valueIndex = index;
        }
      });
      if (value) {
        onNearestX(value, {
          innerX: xScaleFn(value),
          index: valueIndex!,
          event: (event as any).nativeEvent
        });
      }
    },
    [data, getAttributeFunctorFor, getXYCoordinateInContainer, onNearestX]
  );

  const handleNearestXY = useCallback(
    (event: React.SyntheticEvent<SVGElement>) => {
      if (!onNearestXY || !data) return;
      const xScaleFn = getAttributeFunctorFor('x');
      const yScaleFn = getAttributeFunctorFor('y');
      if (!xScaleFn || !yScaleFn) return;

      const coordinate = getXYCoordinateInContainer(event);
      const foundPoint = voronoi<T>().x(xScaleFn).y(yScaleFn)(data).find(
        coordinate.x,
        coordinate.y
      );
      if (!foundPoint || !foundPoint.data) return;
      onNearestXY(foundPoint.data, {
        innerX: foundPoint[0],
        innerY: foundPoint[1],
        index: foundPoint.index,
        event: (event as any).nativeEvent
      });
    },
    [data, getAttributeFunctorFor, getXYCoordinateInContainer, onNearestXY]
  );

  const onParentMouseMove = useCallback(
    (event: React.SyntheticEvent<SVGElement>) => {
      if (onNearestXY) handleNearestXY(event);
      else if (onNearestX) handleNearestX(event);
    },
    [handleNearestX, handleNearestXY, onNearestX, onNearestXY]
  );

  const onParentTouchMove = useCallback(
    (event: React.TouchEvent<SVGElement>) => {
      event.preventDefault();
      onParentMouseMove(event as any);
    },
    [onParentMouseMove]
  );

  const onParentTouchStart = useCallback(
    (event: React.TouchEvent<SVGElement>) => event.preventDefault(),
    []
  );

  const createValueHandler = useCallback(
    (callback?: RVEventHandler<T>, seriesCallback?: RVSeriesEventHandler) =>
      callback || seriesCallback
        ? (value: T, event: React.MouseEvent<SVGElement>) => {
            if (callback) callback(value, {event: event.nativeEvent});
            if (seriesCallback) seriesCallback({event: event.nativeEvent});
          }
        : undefined,
    []
  );

  const createSeriesHandler = useCallback(
    (callback?: RVSeriesEventHandler) =>
      callback
        ? (event: React.MouseEvent<SVGElement>) =>
            callback({event: event.nativeEvent})
        : undefined,
    []
  );

  return {
    ...callbacks,
    data,
    getAttr0Functor: getAttr0FunctorFor,
    getAttributeFunctor: getAttributeFunctorFor,
    getAttributeValue: getAttributeValueFor,
    getScaleDistance,
    onParentMouseMove,
    onParentTouchMove,
    onParentTouchStart,
    _handleNearestX: handleNearestX,
    _handleNearestXY: handleNearestXY,
    onValueMouseOverHandler: createValueHandler(
      callbacks.onValueMouseOver,
      callbacks.onSeriesMouseOver
    ),
    onValueMouseOutHandler: createValueHandler(
      callbacks.onValueMouseOut,
      callbacks.onSeriesMouseOut
    ),
    onValueClickHandler: createValueHandler(
      callbacks.onValueClick,
      callbacks.onSeriesClick
    ),
    onValueRightClickHandler: createValueHandler(
      callbacks.onValueRightClick,
      callbacks.onSeriesRightClick
    ),
    onSeriesMouseOverHandler: createSeriesHandler(callbacks.onSeriesMouseOver),
    onSeriesMouseOutHandler: createSeriesHandler(callbacks.onSeriesMouseOut),
    onSeriesClickHandler: createSeriesHandler(callbacks.onSeriesClick),
    onSeriesRightClickHandler: createSeriesHandler(callbacks.onSeriesRightClick)
  };
}
