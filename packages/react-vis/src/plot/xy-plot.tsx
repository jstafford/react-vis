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
import equal from 'deep-equal';

import {AnimationParam} from 'animation';
import {CanvasWrapper} from './series/canvas-wrapper';

import {getCombinedClassName} from 'utils/styling-utils';
import {
  getInnerDimensions,
  Margin,
  DEFAULT_MARGINS
} from 'utils/chart-utils';
import {
  extractScalePropsFromProps,
  getMissingScaleProps,
  getOptionalScaleProps,
  getXYPlotValues
} from 'utils/scales-utils';
import {
  getStackedData,
  getSeriesChildren,
  getSeriesPropsFromChildren,
  RVDatum
} from 'utils/series-utils';
import {
  CONTINUOUS_COLOR_RANGE,
  EXTENDED_DISCRETE_COLOR_RANGE,
  SIZE_RANGE,
  OPACITY_TYPE
} from 'theme';

const ATTRIBUTES = [
  'x',
  'y',
  'radius',
  'angle',
  'color',
  'fill',
  'stroke',
  'opacity',
  'size'
] as const;

type ScaleAttribute = (typeof ATTRIBUTES)[number];
type PlotData = Array<RVDatum[] | null>;
type SeriesPropsInfo = Array<{[key: string]: any} | undefined>;
type PlotEvent = React.SyntheticEvent<SVGSVGElement>;
type PlotEventHandler = (event: PlotEvent) => void;

interface ParentConfig {
  isDomainAdjustmentNeeded?: boolean;
  zeroBaseValue?: boolean;
}

interface ParentSeriesComponent {
  onParentMouseDown?: PlotEventHandler;
  onParentMouseEnter?: PlotEventHandler;
  onParentMouseLeave?: PlotEventHandler;
  onParentMouseMove?: PlotEventHandler;
  onParentMouseUp?: PlotEventHandler;
  onParentTouchMove?: PlotEventHandler;
  onParentTouchStart?: PlotEventHandler;
}

type SeriesComponentType = React.JSXElementConstructor<any> & {
  requiresSVG?: boolean;
  isCanvas?: boolean;
  getParentConfig?: (attr?: string, props?: {[key: string]: any}) => ParentConfig;
  prototype?: {render?: unknown};
};

interface ScaleMixins {
  _allData: PlotData;
  _adjustBy: string[];
  _adjustWhat: number[];
  _stackBy?: string;
  [key: string]: any;
}

interface XYPlotProps {
  animation?: AnimationParam;
  children?: React.ReactNode;
  className?: string;
  dontCheckIfEmpty?: boolean;
  hasTreeStructure?: boolean;
  height: number;
  margin?: Margin | number;
  onClick?: PlotEventHandler;
  onDoubleClick?: PlotEventHandler;
  onMouseDown?: PlotEventHandler;
  onMouseUp?: PlotEventHandler;
  onMouseEnter?: PlotEventHandler;
  onMouseLeave?: PlotEventHandler;
  onMouseMove?: PlotEventHandler;
  onTouchStart?: PlotEventHandler;
  onTouchMove?: PlotEventHandler;
  onTouchEnd?: PlotEventHandler;
  onTouchCancel?: PlotEventHandler;
  onWheel?: React.WheelEventHandler<SVGSVGElement>;
  stackBy?: ScaleAttribute;
  style?: React.CSSProperties;
  width: number;
  [key: string]: any;
}

interface XYPlotState {
  data: PlotData;
  scaleMixins: ScaleMixins;
}

const getSeriesComponentType = (componentType: React.ReactElement['type']): SeriesComponentType | null => {
  return typeof componentType === 'string'
    ? null
    : (componentType as SeriesComponentType);
};

const requiresSVG = (component: React.ReactElement): boolean => {
  const componentType = getSeriesComponentType(component.type);
  return componentType ? Boolean(componentType.requiresSVG) : false;
};

const isCanvasComponent = (component: React.ReactElement): boolean => {
  const componentType = getSeriesComponentType(component.type);
  return componentType ? Boolean(componentType.isCanvas) : false;
};

const cleanseData = (data: PlotData): PlotData => {
  return data.map(series => {
    if (!Array.isArray(series)) {
      return series;
    }
    return series.map(row => ({...row, parent: null}));
  });
};

const checkIfMixinsAreEqual = (nextScaleMixins: ScaleMixins,
  scaleMixins: ScaleMixins,
  hasTreeStructure?: boolean): boolean => {
  const newMixins = {
    ...nextScaleMixins,
    _allData: hasTreeStructure
      ? cleanseData(nextScaleMixins._allData)
      : nextScaleMixins._allData
  };
  const oldMixins = {
    ...scaleMixins,
    _allData: hasTreeStructure
      ? cleanseData(scaleMixins._allData)
      : scaleMixins._allData
  };
  return equal(newMixins, oldMixins);
};

const getDefaultScaleProps = (props: XYPlotProps): {[key: string]: any} => {
  const {innerWidth, innerHeight} = getInnerDimensions(props, DEFAULT_MARGINS);
  const colorRanges = ['color', 'fill', 'stroke'].reduce(
    (acc: {[key: string]: any}, attr) => {
      const range =
        props[`${attr}Type`] === 'category'
          ? EXTENDED_DISCRETE_COLOR_RANGE
          : CONTINUOUS_COLOR_RANGE;
      return {...acc, [`${attr}Range`]: range};
    },
    {}
  );

  return {
    xRange: [0, innerWidth],
    yRange: [innerHeight, 0],
    ...colorRanges,
    opacityType: OPACITY_TYPE,
    sizeRange: SIZE_RANGE
  };
};

const getScaleMixins = (data: PlotData, props: XYPlotProps): ScaleMixins => {
  const filteredData = data.filter((datum): datum is RVDatum[] => Boolean(datum));
  const allData = ([] as RVDatum[]).concat(...filteredData);
  const attributes = ATTRIBUTES as unknown as string[];
  const defaultScaleProps = getDefaultScaleProps(props);
  const optionalScaleProps = getOptionalScaleProps(props);
  const userScaleProps = extractScalePropsFromProps(props, attributes);
  const missingScaleProps = getMissingScaleProps(
    {
      ...defaultScaleProps,
      ...optionalScaleProps,
      ...userScaleProps
    },
    allData,
    attributes
  );
  const children = getSeriesChildren(props.children);
  const zeroBaseProps: {[key: string]: any} = {};
  const adjustBy = new Set<string>();
  const adjustWhat = new Set<number>();

  children.forEach((child, index) => {
    if (!child || !data[index]) {
      return;
    }
    ATTRIBUTES.forEach(attr => {
      const childType = getSeriesComponentType(child.type);
      const parentConfig =
        childType && childType.getParentConfig
          ? childType.getParentConfig(attr, child.props)
          : {};
      const {isDomainAdjustmentNeeded, zeroBaseValue} = parentConfig;
      if (isDomainAdjustmentNeeded) {
        adjustBy.add(attr);
        adjustWhat.add(index);
      }
      if (zeroBaseValue) {
        const specifiedDomain = props[`${attr}Domain`];
        zeroBaseProps[`${attr}BaseValue`] = specifiedDomain
          ? specifiedDomain[0]
          : 0;
      }
    });
  });

  return {
    ...defaultScaleProps,
    ...zeroBaseProps,
    ...userScaleProps,
    ...missingScaleProps,
    _allData: data,
    _adjustBy: Array.from(adjustBy),
    _adjustWhat: Array.from(adjustWhat),
    _stackBy: props.stackBy
  };
};

const isPlotEmpty = (data: PlotData): boolean => {
  return !data || !data.length || !data.some(series => series && series.some(d => d));
};

export const XYPlotImplementation = (props: XYPlotProps): React.ReactElement => {
  const seriesRefs = React.useRef<Record<number, ParentSeriesComponent | null>>({});
  const stateRef = React.useRef<XYPlotState | null>(null);
  const children = getSeriesChildren(props.children);
  const data = getStackedData(children, props.stackBy as string);
  const nextScaleMixins = getScaleMixins(data, props);

  if (
    !stateRef.current ||
    !checkIfMixinsAreEqual(
      nextScaleMixins,
      stateRef.current.scaleMixins,
      props.hasTreeStructure
    )
  ) {
    stateRef.current = {data, scaleMixins: nextScaleMixins};
  }
  const state = stateRef.current;
  const {animation} = props;
  const dimensions = getInnerDimensions(props, DEFAULT_MARGINS);
  const childElements = React.Children.toArray(props.children) as React.ReactElement[];
  const seriesProps = getSeriesPropsFromChildren(childElements) as SeriesPropsInfo;
  const xyPlotValues = getXYPlotValues(props, childElements);
  const {scaleMixins} = state;
  const { _allData, _adjustBy, _adjustWhat, _stackBy, ...safeScaleMixins } = scaleMixins;

  const components = childElements.map((child, index) => {
    let dataProps: {data: RVDatum[] | null} | null = null;
    if (seriesProps[index]) {
      const {seriesIndex} = seriesProps[index] as {[key: string]: any};
      dataProps = {data: state.data[seriesIndex]};
    }

    const childType = getSeriesComponentType(child.type);
    const supportsRef =
      Boolean(dataProps) &&
      Boolean(childType) &&
      Boolean(childType?.prototype && childType.prototype.render);

    return React.cloneElement(child, {
      ...dimensions,
      animation,
      ...(supportsRef
        ? {
            ref: (ref: ParentSeriesComponent | null) => {
              seriesRefs.current[(seriesProps[index] as {[key: string]: any}).seriesIndex] = ref;
            }
          }
        : {}),
      ...seriesProps[index],
      ...safeScaleMixins,
      ...child.props,
      ...xyPlotValues[index],
      ...dataProps
    });
  });

  const notifySeries = (handlerName: keyof ParentSeriesComponent,
    event: PlotEvent): void => {
    const seriesChildren = getSeriesChildren(props.children);
    seriesChildren.forEach((_child, index) => {
      const component = seriesRefs.current[index];
      const handler = component && component[handlerName];
      if (handler) {
        handler.call(component, event);
      }
    });
  };

  const handleEvent = (
    event: PlotEvent,
    propName: keyof XYPlotProps,
    seriesHandler?: keyof ParentSeriesComponent
  ) => {
    const handler = props[propName] as PlotEventHandler | undefined;
    if (handler) handler(event);
    if (seriesHandler) notifySeries(seriesHandler, event);
  };

  const {
    className = '',
    dontCheckIfEmpty,
    style,
    width,
    height,
    onWheel
  } = props;

  if (!dontCheckIfEmpty && isPlotEmpty(state.data)) {
    return (
      <div
        className={getCombinedClassName('rv-xy-plot', className)}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          ...style
        }}
      />
    );
  }

  const canvasComponents = components.filter(
    component => component && !requiresSVG(component) && isCanvasComponent(component)
  );
  let canvas = null;
  if (canvasComponents.length) {
    const {
      marginLeft,
      marginTop,
      marginBottom,
      marginRight,
      innerHeight,
      innerWidth
    } = canvasComponents[0].props as {[key: string]: any};
    canvas = (
      <CanvasWrapper
        {...{
          innerHeight,
          innerWidth,
          marginLeft,
          marginTop,
          marginBottom,
          marginRight
        }}
      >
        {canvasComponents}
      </CanvasWrapper>
    );
  }

  return (
    <div
      style={{width: `${width}px`, height: `${height}px`}}
      className={getCombinedClassName('rv-xy-plot', className)}
    >
      <svg
        className="rv-xy-plot__inner"
        width={width}
        height={height}
        style={style}
        onClick={event => handleEvent(event, 'onClick')}
        onDoubleClick={event => handleEvent(event, 'onDoubleClick')}
        onMouseDown={event => handleEvent(event, 'onMouseDown', 'onParentMouseDown')}
        onMouseUp={event => handleEvent(event, 'onMouseUp', 'onParentMouseUp')}
        onMouseMove={event => handleEvent(event, 'onMouseMove', 'onParentMouseMove')}
        onMouseLeave={event => handleEvent(event, 'onMouseLeave', 'onParentMouseLeave')}
        onMouseEnter={event => handleEvent(event, 'onMouseEnter', 'onParentMouseEnter')}
        onTouchStart={event => handleEvent(event, 'onTouchStart', 'onParentTouchStart')}
        onTouchMove={event => handleEvent(event, 'onTouchMove', 'onParentTouchMove')}
        onTouchEnd={event => handleEvent(event, 'onTouchEnd')}
        onTouchCancel={event => handleEvent(event, 'onTouchCancel')}
        onWheel={onWheel}
      >
        {components.filter(component => component && requiresSVG(component))}
      </svg>
      {canvas}
      {components.filter(
        component => component && !requiresSVG(component) && !isCanvasComponent(component)
      )}
    </div>
  );
};

(XYPlotImplementation as any).displayName = 'XYPlot';
(XYPlotImplementation as any).defaultProps = {className: ''};
(XYPlotImplementation as any)._getDefaultScaleProps = getDefaultScaleProps;
(XYPlotImplementation as any)._getScaleMixins = getScaleMixins;

export const XYPlot: any = XYPlotImplementation;
XYPlot.displayName = 'XYPlot';
XYPlot.defaultProps = (XYPlotImplementation as any).defaultProps;
XYPlot._getDefaultScaleProps = getDefaultScaleProps;
XYPlot._getScaleMixins = getScaleMixins;
