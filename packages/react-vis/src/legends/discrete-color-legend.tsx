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

import DiscreteColorLegendItem, {
  DiscreteColorLegendItemProps,
  LegendOrientation
} from 'legends/discrete-color-legend-item';
import {DISCRETE_COLOR_RANGE} from 'theme';
import {getCombinedClassName} from 'utils/styling-utils';

export interface LegendItem {
  title: React.ReactNode;
  color?: string;
  disabled?: boolean;
  strokeDasharray?: string;
  strokeStyle?: DiscreteColorLegendItemProps['strokeStyle'];
  strokeWidth?: number;
}

export type LegendItemValue = LegendItem | string | React.ReactElement;

export interface DiscreteColorLegendProps {
  className?: string;
  colors?: string[];
  height?: number;
  items: LegendItemValue[];
  onItemClick?: (
    item: LegendItemValue,
    index: number,
    event: React.MouseEvent<HTMLDivElement>
  ) => void;
  onItemMouseEnter?: (
    item: LegendItemValue,
    index: number,
    event: React.MouseEvent<HTMLDivElement>
  ) => void;
  onItemMouseLeave?: (
    item: LegendItemValue,
    index: number,
    event: React.MouseEvent<HTMLDivElement>
  ) => void;
  orientation?: LegendOrientation;
  style?: React.CSSProperties;
  width?: number;
}

function getItemTitle(item: LegendItemValue): React.ReactNode {
  return typeof item === 'object' && item && 'title' in item && (item as LegendItem).title
    ? (item as LegendItem).title
    : item;
}

function getItemColor(item: LegendItemValue, colors: string[], index: number): string {
  return typeof item === 'object' && item && 'color' in item && (item as LegendItem).color
    ? (item as LegendItem).color as string
    : colors[index % colors.length];
}

function getOptionalLegendProp<T extends keyof LegendItem>(
  item: LegendItemValue,
  propName: T
): LegendItem[T] | undefined {
  return typeof item === 'object' && item && propName in item
    ? (item as LegendItem)[propName]
    : undefined;
}

function DiscreteColorLegend({
  className = '',
  colors = DISCRETE_COLOR_RANGE,
  height,
  items,
  onItemClick,
  onItemMouseEnter,
  onItemMouseLeave,
  orientation = 'vertical',
  style,
  width
}: DiscreteColorLegendProps): JSX.Element {
  return (
    <div
      className={getCombinedClassName(
        'rv-discrete-color-legend',
        orientation,
        className
      )}
      style={{width, height, ...style}}
    >
      {items.map((item, index) => (
        <DiscreteColorLegendItem
          title={getItemTitle(item)}
          color={getItemColor(item, colors, index)}
          strokeDasharray={getOptionalLegendProp(item, 'strokeDasharray')}
          strokeStyle={getOptionalLegendProp(item, 'strokeStyle')}
          strokeWidth={getOptionalLegendProp(item, 'strokeWidth')}
          disabled={Boolean(getOptionalLegendProp(item, 'disabled'))}
          orientation={orientation}
          key={index}
          onClick={
            onItemClick ? event => onItemClick(item, index, event) : null
          }
          onMouseEnter={
            onItemMouseEnter
              ? event => onItemMouseEnter(item, index, event)
              : null
          }
          onMouseLeave={
            onItemMouseEnter && onItemMouseLeave
              ? event => onItemMouseLeave(item, index, event)
              : null
          }
        />
      ))}
    </div>
  );
}

(DiscreteColorLegend as any).displayName = 'DiscreteColorLegendItem';
(DiscreteColorLegend as any).propTypes = {
  className: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.shape({
        title: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
          .isRequired,
        color: PropTypes.string,
        disabled: PropTypes.bool
      }),
      PropTypes.string.isRequired,
      PropTypes.element
    ])
  ).isRequired,
  onItemClick: PropTypes.func,
  onItemMouseEnter: PropTypes.func,
  onItemMouseLeave: PropTypes.func,
  height: PropTypes.number,
  width: PropTypes.number,
  orientation: PropTypes.oneOf(['vertical', 'horizontal'])
};
(DiscreteColorLegend as any).defaultProps = {
  className: '',
  colors: DISCRETE_COLOR_RANGE,
  orientation: 'vertical'
};

export default DiscreteColorLegend;