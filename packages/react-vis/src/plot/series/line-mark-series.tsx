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

import AbstractSeries, {AbstractSeriesProps} from './abstract-series';
import LineSeries from './line-series';
import MarkSeries from './mark-series';

export interface LineMarkSeriesProps extends AbstractSeriesProps<any> {
  lineStyle?: React.CSSProperties | {[key: string]: any};
  markStyle?: React.CSSProperties | {[key: string]: any};
}

const propTypes = {
  ...(LineSeries as any).propTypes,
  lineStyle: PropTypes.object,
  markStyle: PropTypes.object
};

function LineMarkSeries(props: LineMarkSeriesProps): JSX.Element {
  const {lineStyle, markStyle, style} = props;
  return (
    <g className="rv-xy-plot__series rv-xy-plot__series--linemark">
      <LineSeries {...props} style={{...style, ...lineStyle}} />
      <MarkSeries {...props} style={{...style, ...markStyle}} />
    </g>
  );
}

(LineMarkSeries as any).requiresSVG = true;
(LineMarkSeries as any).defaultProps = {
  ...(LineSeries as any).defaultProps,
  lineStyle: {},
  markStyle: {}
};
(LineMarkSeries as any).displayName = 'LineMarkSeries';
(LineMarkSeries as any).propTypes = propTypes;

export default LineMarkSeries;
