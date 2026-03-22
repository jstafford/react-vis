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
import {
  hierarchy,
  pack,
  partition,
  treemapSquarify,
  treemapResquarify,
  treemapSlice,
  treemapDice,
  treemapSliceDice,
  treemapBinary,
  treemap
} from 'd3-hierarchy';

import {
  CONTINUOUS_COLOR_RANGE,
  DEFAULT_COLOR,
  DEFAULT_OPACITY,
  OPACITY_TYPE
} from 'theme';
import {AnimationParam, AnimationPropType} from 'animation';
import {getAttributeFunctor, getMissingScaleProps} from 'utils/scales-utils';
import {Margin, MarginPropType, getInnerDimensions} from 'utils/chart-utils';

import TreemapDOM from './treemap-dom';
import TreemapSVG from './treemap-svg';

const TREEMAP_TILE_MODES = {
  squarify: treemapSquarify,
  resquarify: treemapResquarify,
  slice: treemapSlice,
  dice: treemapDice,
  slicedice: treemapSliceDice,
  binary: treemapBinary
};

const TREEMAP_LAYOUT_MODES = ['circlePack', 'partition', 'partition-pivot'] as const;

const NOOP = (datum: any) => datum;

const ATTRIBUTES = ['opacity', 'color'] as const;

const DEFAULT_MARGINS: Required<Margin> = {
  left: 40,
  right: 10,
  top: 10,
  bottom: 40
};

const DEFAULT_SORT_FUNCTION = (
  a: any,
  b: any,
  accessor?: (datum: any) => number
) => {
  if (!accessor) {
    return 0;
  }
  return accessor(a) - accessor(b);
};

const DEFAULT_GET_SIZE = (datum: any) => datum.size;

export type TreemapMode = keyof typeof TREEMAP_TILE_MODES | (typeof TREEMAP_LAYOUT_MODES)[number];

export interface TreemapDatum {
  title?: string;
  name?: string;
  color?: string;
  size?: number;
  label?: string;
  style?: React.CSSProperties;
  children?: TreemapDatum[];
  [key: string]: any;
}

export interface TreemapNode {
  data: TreemapDatum;
  parent?: TreemapNode | null;
  children?: TreemapNode[] | null;
  depth?: number;
  value?: number;
  x?: number;
  y?: number;
  r?: number;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
  [key: string]: any;
}

export interface TreemapScales {
  opacity: (datum: any) => any;
  color: (datum: any) => any;
}

export interface TreemapProps {
  animation?: AnimationParam;
  className?: string;
  data: TreemapDatum;
  height: number;
  hideRootNode?: boolean;
  margin?: Margin;
  mode?: TreemapMode;
  onLeafClick?: (node: TreemapNode, event?: React.SyntheticEvent<any>) => void;
  onLeafMouseOver?: (node: TreemapNode, event?: React.SyntheticEvent<any>) => void;
  onLeafMouseOut?: (node: TreemapNode, event?: React.SyntheticEvent<any>) => void;
  useCirclePacking?: boolean;
  padding: number;
  sortFunction?: (a: any, b: any, accessor?: (datum: any) => number) => number;
  width: number;
  getSize?: (datum: any) => number;
  getColor?: (datum: any) => any;
  getLabel?: (datum: any) => any;
  renderMode?: 'DOM' | 'SVG';
  style?: React.CSSProperties;
  colorRange?: string[];
  opacityType?: string;
  _colorValue?: string;
  _opacityValue?: number;
  [key: string]: any;
}

/**
 * Get the map of scale functions from the given props.
 * @param {Object} props Props for the component.
 * @returns {Object} Map of scale functions.
 * @private
 */
function _getScaleFns(props: TreemapProps): TreemapScales {
  const {data} = props;
  const allData = data.children || [];

  const compatibleProps = {
    ...props,
    ...getMissingScaleProps(props, allData, ATTRIBUTES as unknown as string[]),
    _allData: allData
  };
  return {
    opacity: getAttributeFunctor(compatibleProps, 'opacity') as (datum: any) => any,
    color: getAttributeFunctor(compatibleProps, 'color') as (datum: any) => any
  };
}

function Treemap(props: TreemapProps): JSX.Element {
  const scales = _getScaleFns(props);
  const innerDimensions = getInnerDimensions(props, props.margin || DEFAULT_MARGINS);

  function _getNodesToRender(): TreemapNode[] {
    const {innerWidth, innerHeight} = innerDimensions;
    const {
      data,
      mode = 'squarify',
      padding,
      sortFunction = DEFAULT_SORT_FUNCTION,
      getSize = DEFAULT_GET_SIZE
    } = props;
    if (!data) {
      return [];
    }

    if (mode === 'partition' || mode === 'partition-pivot') {
      const partitionFunction = partition<any>()
        .size(
          mode === 'partition-pivot'
            ? [innerHeight, innerWidth]
            : [innerWidth, innerHeight]
        )
        .padding(padding);
      const structuredInput = hierarchy<any>(data)
        .sum(getSize)
        .sort((a, b) => sortFunction(a, b, getSize));
      const mappedNodes = partitionFunction(structuredInput).descendants() as any[];
      if (mode === 'partition-pivot') {
        return mappedNodes.map(node => ({
          ...node,
          x0: node.y0,
          x1: node.y1,
          y0: node.x0,
          y1: node.x1
        }));
      }
      return mappedNodes;
    }
    if (mode === 'circlePack') {
      const packingFunction = pack<any>()
        .size([innerWidth, innerHeight])
        .padding(padding);
      const structuredInput = hierarchy<any>(data)
        .sum(getSize)
        .sort((a, b) => sortFunction(a, b, getSize));
      return packingFunction(structuredInput).descendants() as any[];
    }

    const tileFn = TREEMAP_TILE_MODES[mode as keyof typeof TREEMAP_TILE_MODES];
    const treemapingFunction = treemap<any>()
      .tile(tileFn)
      .size([innerWidth, innerHeight])
      .padding(padding);
    const structuredInput = hierarchy<any>(data)
      .sum(getSize)
      .sort((a, b) => sortFunction(a, b, getSize));
    return treemapingFunction(structuredInput).descendants() as any[];
  }

  const {renderMode} = props;
  const nodes = _getNodesToRender();
  const TreemapElement = renderMode === 'SVG' ? TreemapSVG : TreemapDOM;

  return <TreemapElement {...props} nodes={nodes} scales={scales} />;
}

(Treemap as any).displayName = 'Treemap';
(Treemap as any).propTypes = {
  animation: AnimationPropType,
  className: PropTypes.string,
  data: PropTypes.object.isRequired,
  height: PropTypes.number.isRequired,
  hideRootNode: PropTypes.bool,
  margin: MarginPropType,
  mode: PropTypes.oneOf(
    Object.keys(TREEMAP_TILE_MODES).concat(TREEMAP_LAYOUT_MODES as unknown as string[])
  ),
  onLeafClick: PropTypes.func,
  onLeafMouseOver: PropTypes.func,
  onLeafMouseOut: PropTypes.func,
  useCirclePacking: PropTypes.bool,
  padding: PropTypes.number.isRequired,
  sortFunction: PropTypes.func,
  width: PropTypes.number.isRequired,
  getSize: PropTypes.func,
  getColor: PropTypes.func
};

(Treemap as any).defaultProps = {
  className: '',
  colorRange: CONTINUOUS_COLOR_RANGE,
  _colorValue: DEFAULT_COLOR,
  data: {
    children: []
  },
  hideRootNode: false,
  margin: DEFAULT_MARGINS,
  mode: 'squarify',
  onLeafClick: NOOP,
  onLeafMouseOver: NOOP,
  onLeafMouseOut: NOOP,
  opacityType: OPACITY_TYPE,
  _opacityValue: DEFAULT_OPACITY,
  padding: 1,
  sortFunction: DEFAULT_SORT_FUNCTION,
  getSize: DEFAULT_GET_SIZE,
  getColor: (datum: any) => datum.color,
  getLabel: (datum: any) => datum.title
};

export default Treemap;