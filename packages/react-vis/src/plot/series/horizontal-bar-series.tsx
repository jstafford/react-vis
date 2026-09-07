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

import AbstractSeries, {AbstractSeriesProps} from './abstract-series';
import BarSeries from './bar-series';

export interface HorizontalBarSeriesProps extends AbstractSeriesProps<any> {}

function HorizontalBarSeries(props: HorizontalBarSeriesProps): JSX.Element {
  return (
    <BarSeries
      {...props}
      linePosAttr="y"
      valuePosAttr="x"
      lineSizeAttr="height"
      valueSizeAttr="width"
    />
  );
}

(HorizontalBarSeries as any).requiresSVG = true;
(HorizontalBarSeries as any).getParentConfig = (attr?: string) => {
  const isDomainAdjustmentNeeded = attr === 'y';
  const zeroBaseValue = attr === 'x';
  return {
    isDomainAdjustmentNeeded,
    zeroBaseValue
  };
};
(HorizontalBarSeries as any).defaultProps = (AbstractSeries as any).defaultProps;
(HorizontalBarSeries as any).propTypes = (AbstractSeries as any).propTypes;
(HorizontalBarSeries as any).displayName = 'HorizontalBarSeries';

export default HorizontalBarSeries;
