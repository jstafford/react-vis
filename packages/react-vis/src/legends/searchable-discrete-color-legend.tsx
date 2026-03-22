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

import DiscreteColorLegend, {
  DiscreteColorLegendProps,
  LegendItemValue
} from 'legends/discrete-color-legend';
import {getCombinedClassName} from 'utils/styling-utils';

export interface SearchableDiscreteColorLegendProps
  extends DiscreteColorLegendProps {
  searchText?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  searchFn?: (items: LegendItemValue[], search: string) => LegendItemValue[];
}

const propTypes = {
  ...(DiscreteColorLegend as any).propTypes,
  searchText: PropTypes.string,
  onSearchChange: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  searchFn: PropTypes.func
};

const defaultProps = {
  className: '',
  searchText: '',
  searchFn: (items: LegendItemValue[], search: string) =>
    items.filter(item =>
      String(
        typeof item === 'object' && item && 'title' in item
          ? (item as {title: React.ReactNode}).title
          : item
      )
        .toLowerCase()
        .indexOf(search) !== -1
    )
};

function SearchableDiscreteColorLegend(
  props: SearchableDiscreteColorLegendProps
): JSX.Element {
  const {
    className = '',
    colors,
    height,
    items,
    onItemClick,
    onItemMouseEnter,
    onItemMouseLeave,
    onSearchChange,
    orientation,
    searchFn = defaultProps.searchFn,
    searchPlaceholder,
    searchText = '',
    width
  } = props;
  const onChange = onSearchChange
    ? ({target: {value}}: React.ChangeEvent<HTMLInputElement>) =>
        onSearchChange(value)
    : undefined;
  const filteredItems = searchFn(items, searchText);
  return (
    <div
      className={getCombinedClassName('rv-search-wrapper', className)}
      style={{width, height}}
    >
      <form className="rv-search-wrapper__form">
        <input
          type="search"
          placeholder={searchPlaceholder}
          className="rv-search-wrapper__form__input"
          value={searchText}
          onChange={onChange}
        />
      </form>
      <div className="rv-search-wrapper__contents">
        <DiscreteColorLegend
          colors={colors}
          items={filteredItems}
          onItemClick={onItemClick}
          onItemMouseEnter={onItemMouseEnter}
          onItemMouseLeave={onItemMouseLeave}
          orientation={orientation}
        />
      </div>
    </div>
  );
}

(SearchableDiscreteColorLegend as any).propTypes = propTypes;
(SearchableDiscreteColorLegend as any).defaultProps = defaultProps;
(SearchableDiscreteColorLegend as any).displayName =
  'SearchableDiscreteColorLegend';

export default SearchableDiscreteColorLegend;