import {describe, expect, test, vi} from 'vitest';
import BarSeriesCanvas from '../bar-series-canvas';
import RectSeriesCanvas from '../rect-series-canvas';
import LineMarkSeriesCanvas from '../line-mark-series-canvas';

const linearProps = {
  xRange: [0, 100],
  xDomain: [0, 10],
  xType: 'linear',
  yRange: [100, 0],
  yDomain: [0, 10],
  yType: 'linear',
  color: 'red',
  opacity: 1,
  marginLeft: 5,
  marginTop: 10,
  marginBottom: 0
};

function context() {
  return {
    beginPath: vi.fn(),
    rect: vi.fn(),
    arc: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    closePath: vi.fn(),
    setLineDash: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1
  } as any;
}

describe('Canvas variants', () => {
  test('draws bar and rect layers', () => {
    const canvas = context();
    BarSeriesCanvas.renderLayer({
      ...linearProps,
      data: [{x: 5, y: 8}],
      linePosAttr: 'x',
      lineSizeAttr: 'width',
      valuePosAttr: 'y',
      valueSizeAttr: 'height'
    }, canvas);
    RectSeriesCanvas.renderLayer({
      ...linearProps,
      data: [{x: 2, x0: 1, y: 8, y0: 4}],
      linePosAttr: 'x',
      lineSizeAttr: 'width',
      valuePosAttr: 'y',
      valueSizeAttr: 'height'
    }, canvas);

    expect(canvas.rect).toHaveBeenCalledTimes(2);
    expect(canvas.fill).toHaveBeenCalledTimes(2);
    expect(canvas.stroke).toHaveBeenCalledTimes(2);
  });

  test('composes line and mark drawing layers', () => {
    const canvas = context();
    LineMarkSeriesCanvas.renderLayer({
      ...linearProps,
      data: [{x: 0, y: 0}, {x: 10, y: 10}],
      size: 3
    }, canvas);

    expect(canvas.moveTo).toHaveBeenCalled();
    expect(canvas.arc).toHaveBeenCalled();
    expect(canvas.stroke).toHaveBeenCalled();
    expect(canvas.fill).toHaveBeenCalled();
  });
});
