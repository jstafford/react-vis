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
import equal from 'deep-equal';

import {AnimationParam, AnimationPropType} from 'animation';
import CanvasWrapper from './series/canvas-wrapper';

import {getCombinedClassName} from 'utils/styling-utils';
import {
  getInnerDimensions,
  Margin,
  MarginPropType,
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

function getSeriesComponentType(
  componentType: React.ReactElement['type']
): SeriesComponentType | null {
  return typeof componentType === 'string'
    ? null
    : (componentType as SeriesComponentType);
}

function requiresSVG(component: React.ReactElement): boolean {
  const componentType = getSeriesComponentType(component.type);
  return componentType ? Boolean(componentType.requiresSVG) : false;
}

function isCanvasComponent(component: React.ReactElement): boolean {
  const componentType = getSeriesComponentType(component.type);
  return componentType ? Boolean(componentType.isCanvas) : false;
}

/**
 * Remove parents from tree formatted data. deep-equal doesnt play nice with data
 * that has circular structures, so we make every node single directional by pruning the parents.
 * @param {Array} data - the data object to have circular deps resolved in
 * @returns {Array} the sanitized data
 */
function cleanseData(data: PlotData): PlotData {
  return data.map(series => {
    if (!Array.isArray(series)) {
      return series;
    }
    return series.map(row => ({...row, parent: null}));
  });
}

/**
 * Wrapper on the deep-equal method for checking equality of next props vs current props
 * @param {Object} scaleMixins - Scale object.
 * @param {Object} nextScaleMixins - Scale object.
 * @param {Boolean} hasTreeStructure - Whether or not to cleanse the data of possible cyclic structures
 * @returns {Boolean} whether or not the two mixins objects are equal
 */
function checkIfMixinsAreEqual(
  nextScaleMixins: ScaleMixins,
  scaleMixins: ScaleMixins,
  hasTreeStructure?: boolean
): boolean {
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
}

class XYPlot extends React.Component<XYPlotProps, XYPlotState> {
  static displayName = 'XYPlot';

  static get defaultProps() {
    return {
      className: ''
    };
  }

  static get propTypes() {
    return {
      animation: AnimationPropType,
      className: PropTypes.string,
      dontCheckIfEmpty: PropTypes.bool,
      height: PropTypes.number.isRequired,
      margin: MarginPropType,
      onClick: PropTypes.func,
      onDoubleClick: PropTypes.func,
      onMouseDown: PropTypes.func,
      onMouseUp: PropTypes.func,
      onMouseEnter: PropTypes.func,
      onMouseLeave: PropTypes.func,
      onMouseMove: PropTypes.func,
      onTouchStart: PropTypes.func,
      onTouchMove: PropTypes.func,
      onTouchEnd: PropTypes.func,
      onTouchCancel: PropTypes.func,
      onWheel: PropTypes.func,
      stackBy: PropTypes.oneOf(ATTRIBUTES),
      style: PropTypes.object,
      width: PropTypes.number.isRequired
    };
  }

  private _seriesRefs: Record<number, ParentSeriesComponent | null> = {};

  constructor(props: XYPlotProps) {
    super(props);
    const {stackBy} = props;
    const children = getSeriesChildren(props.children);
    const data = getStackedData(children, stackBy as string);
    this.state = {
      scaleMixins: XYPlot._getScaleMixins(data, props),
      data
    };
  }

  static getDerivedStateFromProps(
    nextProps: XYPlotProps,
    state: XYPlotState
  ): Partial<XYPlotState> | null {
    const children = getSeriesChildren(nextProps.children);
    const nextData = getStackedData(children, nextProps.stackBy as string);
    const {scaleMixins} = state;
    const nextScaleMixins = XYPlot._getScaleMixins(nextData, nextProps);
    if (
      !checkIfMixinsAreEqual(
        nextScaleMixins,
        scaleMixins,
        nextProps.hasTreeStructure
      )
    ) {
      return {
        scaleMixins: nextScaleMixins,
        data: nextData
      };
    }

    return null;
  }

  /**
   * Trigger click related callbacks if they are available.
   * @param {React.SyntheticEvent} event Click event.
   * @private
   */
  _clickHandler = (event: PlotEvent): void => {
    const {onClick} = this.props;
    if (onClick) {
      onClick(event);
    }
  };

  /**
   * Trigger doule-click related callbacks if they are available.
   * @param {React.SyntheticEvent} event Double-click event.
   * @private
   */
  _doubleClickHandler = (event: PlotEvent): void => {
    const {onDoubleClick} = this.props;
    if (onDoubleClick) {
      onDoubleClick(event);
    }
  };

  /**
   * Prepare the child components (including series) for rendering.
   * @returns {Array} Array of child components.
   * @private
   */
  _getClonedChildComponents(): React.ReactElement[] {
    const props = this.props;
    const {animation} = this.props;
    const {scaleMixins, data} = this.state;
    const dimensions = getInnerDimensions(this.props, DEFAULT_MARGINS);
    const children = React.Children.toArray(this.props.children) as React.ReactElement[];
    const seriesProps = getSeriesPropsFromChildren(children) as SeriesPropsInfo;
    const xyPlotValues = getXYPlotValues(props, children);

    return children.map((child, index) => {
      let dataProps: {data: RVDatum[] | null} | null = null;
      if (seriesProps[index]) {
        const {seriesIndex} = seriesProps[index] as {[key: string]: any};
        dataProps = {data: data[seriesIndex]};
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
                this._seriesRefs[(seriesProps[index] as {[key: string]: any}).seriesIndex] = ref;
              }
            }
          : {}),
        ...seriesProps[index],
        ...scaleMixins,
        ...child.props,
        ...xyPlotValues[index],
        ...dataProps
      });
    });
  }

  /**
   * Get the list of scale-related settings that should be applied by default.
   * @param {Object} props Object of props.
   * @returns {Object} Defaults.
   * @private
   */
  static _getDefaultScaleProps(props: XYPlotProps): {[key: string]: any} {
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
  }

  /**
   * Get the map of scales from the props, apply defaults to them and then pass
   * them further.
   * @param {Object} data Array of all data.
   * @param {Object} props Props of the component.
   * @returns {Object} Map of scale-related props.
   * @private
   */
  static _getScaleMixins(data: PlotData, props: XYPlotProps): ScaleMixins {
    const filteredData = data.filter((datum): datum is RVDatum[] => Boolean(datum));
    const allData = ([] as RVDatum[]).concat(...filteredData);
    const attributes = ATTRIBUTES as unknown as string[];

    const defaultScaleProps = XYPlot._getDefaultScaleProps(props);
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
  }

  /**
   * Checks if the plot is empty or not.
   * Currently checks the data only.
   * @returns {boolean} True for empty.
   * @private
   */
  _isPlotEmpty(): boolean {
    const {data} = this.state;
    return (
      !data ||
      !data.length ||
      !data.some(series => series && series.some(d => d))
    );
  }

  _notifySeries(
    children: React.ReactNode,
    handlerName: keyof ParentSeriesComponent,
    event: PlotEvent
  ): void {
    const seriesChildren = getSeriesChildren(children);
    seriesChildren.forEach((child, index) => {
      if (!child) {
        return;
      }
      const component = this._seriesRefs[index];
      const handler = component && component[handlerName];
      if (handler) {
        handler.call(component, event);
      }
    });
  }

  /**
   * Trigger mouse-down related callbacks if they are available.
   * @param {React.SyntheticEvent} event Mouse down event.
   * @private
   */
  _mouseDownHandler = (event: PlotEvent): void => {
    const {onMouseDown, children} = this.props;
    if (onMouseDown) {
      onMouseDown(event);
    }
    this._notifySeries(children, 'onParentMouseDown', event);
  };

  /**
   * Trigger onMouseEnter handler if it was passed in props.
   * @param {React.SyntheticEvent} event Mouse enter event.
   * @private
   */
  _mouseEnterHandler = (event: PlotEvent): void => {
    const {onMouseEnter, children} = this.props;
    if (onMouseEnter) {
      onMouseEnter(event);
    }
    this._notifySeries(children, 'onParentMouseEnter', event);
  };

  /**
   * Trigger onMouseLeave handler if it was passed in props.
   * @param {React.SyntheticEvent} event Mouse leave event.
   * @private
   */
  _mouseLeaveHandler = (event: PlotEvent): void => {
    const {onMouseLeave, children} = this.props;
    if (onMouseLeave) {
      onMouseLeave(event);
    }
    this._notifySeries(children, 'onParentMouseLeave', event);
  };

  /**
   * Trigger movement-related callbacks if they are available.
   * @param {React.SyntheticEvent} event Mouse move event.
   * @private
   */
  _mouseMoveHandler = (event: PlotEvent): void => {
    const {onMouseMove, children} = this.props;
    if (onMouseMove) {
      onMouseMove(event);
    }
    this._notifySeries(children, 'onParentMouseMove', event);
  };

  /**
   * Trigger mouse-up related callbacks if they are available.
   * @param {React.SyntheticEvent} event Mouse up event.
   * @private
   */
  _mouseUpHandler = (event: PlotEvent): void => {
    const {onMouseUp, children} = this.props;
    if (onMouseUp) {
      onMouseUp(event);
    }
    this._notifySeries(children, 'onParentMouseUp', event);
  };

  /**
   * Trigger onTouchCancel handler if it was passed in props.
   * @param {React.SyntheticEvent} event Touch Cancel event.
   * @private
   */
  _touchCancelHandler = (event: PlotEvent): void => {
    const {onTouchCancel} = this.props;
    if (onTouchCancel) {
      onTouchCancel(event);
    }
  };

  /**
   * Trigger onTouchEnd handler if it was passed in props.
   * @param {React.SyntheticEvent} event Touch End event.
   * @private
   */
  _touchEndHandler = (event: PlotEvent): void => {
    const {onTouchEnd} = this.props;
    if (onTouchEnd) {
      onTouchEnd(event);
    }
  };

  /**
   * Trigger touch movement-related callbacks if they are available.
   * @param {React.SyntheticEvent} event Touch move event.
   * @private
   */
  _touchMoveHandler = (event: PlotEvent): void => {
    const {onTouchMove, children} = this.props;
    if (onTouchMove) {
      onTouchMove(event);
    }
    this._notifySeries(children, 'onParentTouchMove', event);
  };

  /**
   * Trigger touch-start related callbacks if they are available.
   * @param {React.SyntheticEvent} event Touch start event.
   * @private
   */
  _touchStartHandler = (event: PlotEvent): void => {
    const {onTouchStart, children} = this.props;
    if (onTouchStart) {
      onTouchStart(event);
    }
    this._notifySeries(children, 'onParentTouchStart', event);
  };

  renderCanvasComponents(
    components: React.ReactElement[]
  ): React.ReactElement | null {
    const componentsToRender = components.filter(
      component => component && !requiresSVG(component) && isCanvasComponent(component)
    );

    if (componentsToRender.length === 0) {
      return null;
    }
    const {
      marginLeft,
      marginTop,
      marginBottom,
      marginRight,
      innerHeight,
      innerWidth
    } = componentsToRender[0].props as {[key: string]: any};
    return (
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
        {componentsToRender}
      </CanvasWrapper>
    );
  }

  render(): React.ReactElement {
    const {
      className,
      dontCheckIfEmpty,
      style,
      width,
      height,
      onWheel
    } = this.props;

    if (!dontCheckIfEmpty && this._isPlotEmpty()) {
      return (
        <div
          className={getCombinedClassName('rv-xy-plot', className)}
          style={{
            width: `${width}px`,
            height: `${height}px`,
            ...this.props.style
          }}
        />
      );
    }
    const components = this._getClonedChildComponents();
    return (
      <div
        style={{
          width: `${width}px`,
          height: `${height}px`
        }}
        className={getCombinedClassName('rv-xy-plot', className)}
      >
        <svg
          className="rv-xy-plot__inner"
          width={width}
          height={height}
          style={style}
          onClick={this._clickHandler}
          onDoubleClick={this._doubleClickHandler}
          onMouseDown={this._mouseDownHandler}
          onMouseUp={this._mouseUpHandler}
          onMouseMove={this._mouseMoveHandler}
          onMouseLeave={this._mouseLeaveHandler}
          onMouseEnter={this._mouseEnterHandler}
          onTouchStart={this._mouseDownHandler}
          onTouchMove={this._touchMoveHandler}
          onTouchEnd={this._touchEndHandler}
          onTouchCancel={this._touchCancelHandler}
          onWheel={onWheel}
        >
          {components.filter(component => component && requiresSVG(component))}
        </svg>
        {this.renderCanvasComponents(components)}
        {components.filter(
          component => component && !requiresSVG(component) && !isCanvasComponent(component)
        )}
      </div>
    );
  }
}

export default XYPlot;