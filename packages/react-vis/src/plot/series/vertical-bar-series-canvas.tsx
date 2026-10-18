// Copyright (c) 2017 Uber Technologies, Inc.
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

import {SeriesComponentType} from 'seriesComponentType';
import {AbstractSeriesProps} from './abstract-series-hook';
import {BarSeriesCanvas} from './bar-series-canvas';

export interface VerticalBarSeriesCanvasProps extends AbstractSeriesProps<any> {}

interface VerticalBarSeriesCanvasComponent {
  (props: VerticalBarSeriesCanvasProps): null;
  renderLayer: (props: {[key: string]: any}, ctx: CanvasRenderingContext2D) => void;
}

export const VerticalBarSeriesCanvas: SeriesComponentType<VerticalBarSeriesCanvasProps> = (({
  className = '',
  stack = false,
  style = {},
}: VerticalBarSeriesCanvasProps): null => null) as VerticalBarSeriesCanvasComponent;

VerticalBarSeriesCanvas.requiresSVG = false;
VerticalBarSeriesCanvas.isCanvas = true;
VerticalBarSeriesCanvas.displayName = 'VerticalBarSeriesCanvas';
VerticalBarSeriesCanvas.getParentConfig = (attr?: string): {isDomainAdjustmentNeeded: boolean; zeroBaseValue: boolean} => {
    const isDomainAdjustmentNeeded = attr === 'x';
    const zeroBaseValue = attr === 'y';
    return {
      isDomainAdjustmentNeeded,
      zeroBaseValue
    };
};
VerticalBarSeriesCanvas.renderLayer = (props: {[key: string]: any}, ctx: CanvasRenderingContext2D): void => {
    BarSeriesCanvas.renderLayer!(
      {
        ...props,
        linePosAttr: 'x',
        valuePosAttr: 'y',
        lineSizeAttr: 'width',
        valueSizeAttr: 'height'
      },
      ctx
    );
};
