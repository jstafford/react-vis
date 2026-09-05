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

interface CrosshairProps {
  className?: string;
  values?: Array<number | string | object | boolean>;
  series?: object;
  innerWidth?: number;
  innerHeight?: number;
  marginLeft?: number;
  marginTop?: number;
  orientation?: 'left' | 'right';
  itemsFormat?: (values: any[]) => Array<{title: any; value: any}>;
  titleFormat?: (values: any[]) => {title: any; value: any} | undefined;
  style?: {
    line?: React.CSSProperties;
    title?: React.CSSProperties;
    box?: React.CSSProperties;
  };
  children?: React.ReactNode;
  [key: string]: any;
}

function defaultTitleFormat(values: any[]) {
  const value = getFirstNonEmptyValue(values);
  if (value) {
    return {
      title: 'x',
      value: transformValueToString(value.x)
    };
  }
}

function defaultItemsFormat(values: any[]) {
  return values
    .map((v, i) => (v ? {value: v.y, title: i} : null))
    .filter(Boolean) as Array<{value: any; title: any}>;
}

function getFirstNonEmptyValue(values: any[]) {
  return (values || []).find(v => Boolean(v));
}

function Crosshair({
  children,
  className,
  values = [],
  marginTop = 0,
  marginLeft = 0,
  innerWidth = 0,
  innerHeight = 0,
  style = {line: {}, title: {}, box: {}},
  titleFormat = defaultTitleFormat,
  itemsFormat = defaultItemsFormat,
  ...restProps
}: CrosshairProps) {
  const renderCrosshairItems = () => {
    const items = itemsFormat(values);
    if (!items) {
      return null;
    }
    return items
      .filter(Boolean)
      .map(function renderValue(item: any, i: number) {
        return (
          <div className="rv-crosshair__item" key={`item${i}`}>
            <span className="rv-crosshair__item__title">{item.title}</span>
            {': '}
            <span className="rv-crosshair__item__value">{item.value}</span>
          </div>
        );
      });
  };

  const renderCrosshairTitle = () => {
    const titleItem = titleFormat(values);
    if (!titleItem) {
      return null;
    }
    return (
      <div className="rv-crosshair__title" key="title" style={style.title}>
        <span className="rv-crosshair__title__title">{titleItem.title}</span>
        {': '}
        <span className="rv-crosshair__title__value">{titleItem.value}</span>
      </div>
    );
  };

  const props = {
    children,
    className,
    values,
    marginTop,
    marginLeft,
    innerWidth,
    innerHeight,
    style,
    titleFormat,
    itemsFormat,
    ...restProps
  };
  const value = getFirstNonEmptyValue(values);
  if (!value) {
    return null;
  }
  const x = getAttributeFunctor(props, 'x') as (datum: any) => number;
  const innerLeft = x(value);

  const {
    orientation = innerLeft > innerWidth / 2 ? 'left' : 'right'
  } = props;
  const left = marginLeft + innerLeft;
  const top = marginTop;
  const innerClassName = `rv-crosshair__inner rv-crosshair__inner--${orientation}`;

  return (
      <div
        className={getCombinedClassName('rv-crosshair', className)}
        style={{left: `${left}px`, top: `${top}px`}}
      >
        <div
          className="rv-crosshair__line"
          style={{height: `${innerHeight}px`, ...style.line}}
        />

        <div className={innerClassName}>
          {children ? (
            children
          ) : (
            <div className="rv-crosshair__inner__content" style={style.box}>
              <div>
                {renderCrosshairTitle()}
                {renderCrosshairItems()}
              </div>
            </div>
          )}
        </div>
      </div>
  );
}

(Crosshair as any).displayName = 'Crosshair';
(Crosshair as any).defaultProps = {
  titleFormat: defaultTitleFormat,
  itemsFormat: defaultItemsFormat,
  style: {line: {}, title: {}, box: {}}
};
(Crosshair as any).propTypes = {
  className: PropTypes.string,
  values: PropTypes.arrayOf(
    PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
      PropTypes.object,
      PropTypes.bool
    ])
  ),
  series: PropTypes.object,
  innerWidth: PropTypes.number,
  innerHeight: PropTypes.number,
  marginLeft: PropTypes.number,
  marginTop: PropTypes.number,
  orientation: PropTypes.oneOf(['left', 'right']),
  itemsFormat: PropTypes.func,
  titleFormat: PropTypes.func,
  style: PropTypes.shape({
    line: PropTypes.object,
    title: PropTypes.object,
    box: PropTypes.object
  })
};

export default Crosshair;
