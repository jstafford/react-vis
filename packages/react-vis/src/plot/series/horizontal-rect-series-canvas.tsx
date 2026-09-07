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

import AbstractSeries, {AbstractSeriesProps} from './abstract-series';
import RectSeriesCanvas from './rect-series-canvas';

export interface HorizontalRectSeriesCanvasProps extends AbstractSeriesProps<any> {}

interface HorizontalRectSeriesCanvasComponent {
  (props: HorizontalRectSeriesCanvasProps): null;
  renderLayer: (props: {[key: string]: any}, ctx: CanvasRenderingContext2D) => void;
}

const HorizontalRectSeriesCanvas = ((props: HorizontalRectSeriesCanvasProps): null => null) as HorizontalRectSeriesCanvasComponent;

(HorizontalRectSeriesCanvas as any).requiresSVG = false;
(HorizontalRectSeriesCanvas as any).isCanvas = true;
(HorizontalRectSeriesCanvas as any).getParentConfig = (attr?: string): {isDomainAdjustmentNeeded: boolean; zeroBaseValue: boolean} => {
    const isDomainAdjustmentNeeded = false;
    const zeroBaseValue = attr === 'x';
    return {
      isDomainAdjustmentNeeded,
      zeroBaseValue
    };
};
(HorizontalRectSeriesCanvas as any).renderLayer = (props: {[key: string]: any}, ctx: CanvasRenderingContext2D): void => {
    RectSeriesCanvas.renderLayer(
      {
        ...props,
        linePosAttr: 'y',
        valuePosAttr: 'x',
        lineSizeAttr: 'height',
        valueSizeAttr: 'width'
      },
      ctx
    );
};

(HorizontalRectSeriesCanvas as any).displayName = 'HorizontalRectSeriesCanvas';
(HorizontalRectSeriesCanvas as any).defaultProps = (AbstractSeries as any).defaultProps;
(HorizontalRectSeriesCanvas as any).propTypes = {
  ...(AbstractSeries as any).propTypes
};

export default HorizontalRectSeriesCanvas;
