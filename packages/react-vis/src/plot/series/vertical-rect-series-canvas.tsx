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

export interface VerticalRectSeriesCanvasProps extends AbstractSeriesProps<any> {}

interface VerticalRectSeriesCanvasComponent {
  (props: VerticalRectSeriesCanvasProps): null;
  renderLayer: (props: {[key: string]: any}, ctx: CanvasRenderingContext2D) => void;
}

const VerticalRectSeriesCanvas = ((props: VerticalRectSeriesCanvasProps): null => null) as VerticalRectSeriesCanvasComponent;

(VerticalRectSeriesCanvas as any).requiresSVG = false;
(VerticalRectSeriesCanvas as any).isCanvas = true;
(VerticalRectSeriesCanvas as any).getParentConfig = (attr?: string): {isDomainAdjustmentNeeded: boolean; zeroBaseValue: boolean} => {
    const isDomainAdjustmentNeeded = false;
    const zeroBaseValue = attr === 'y';
    return {
      isDomainAdjustmentNeeded,
      zeroBaseValue
    };
};
(VerticalRectSeriesCanvas as any).renderLayer = (props: {[key: string]: any}, ctx: CanvasRenderingContext2D): void => {
    RectSeriesCanvas.renderLayer(
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

(VerticalRectSeriesCanvas as any).displayName = 'VerticalRectSeriesCanvas';
(VerticalRectSeriesCanvas as any).defaultProps = (AbstractSeries as any).defaultProps;
(VerticalRectSeriesCanvas as any).propTypes = {
  ...(AbstractSeries as any).propTypes
};

export default VerticalRectSeriesCanvas;
