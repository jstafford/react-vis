import {describe, expect, test, vi} from 'vitest';
import React from 'react';
import ReactDOM from 'react-dom';
import {act} from 'react-dom/test-utils';
import {renderToStaticMarkup} from 'react-dom/server';
import CanvasWrapper from '../canvas-wrapper';
import LineSeriesCanvas from '../line-series-canvas';
import MarkSeriesCanvas from '../mark-series-canvas';

const scaleProps = {
  xRange: [0, 100],
  xDomain: [0, 2],
  xType: 'linear',
  yRange: [100, 0],
  yDomain: [0, 20],
  yType: 'linear',
  marginLeft: 5,
  marginTop: 10,
  color: 'red',
  opacity: 1
};

describe('Canvas series', () => {
  test('renders a canvas with scaled dimensions', () => {
    const markup = renderToStaticMarkup(
      <CanvasWrapper
        innerWidth={100}
        innerHeight={50}
        marginLeft={5}
        marginRight={10}
        marginTop={10}
        marginBottom={15}
        pixelRatio={2}
      />
    );

    expect(markup).toContain('class="rv-xy-canvas"');
    expect(markup).toContain('height="150"');
    expect(markup).toContain('width="230"');
    expect(markup).toContain('height:75px;width:115px');
  });

  test('draws line and mark layers through a canvas context', () => {
    const context = {
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      scale: vi.fn(),
      stroke: vi.fn(),
      closePath: vi.fn(),
      setLineDash: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1
    } as any;

    LineSeriesCanvas.renderLayer(
      {...scaleProps, data: [{x: 0, y: 0}, {x: 2, y: 20}], strokeWidth: 3},
      context
    );
    MarkSeriesCanvas.renderLayer(
      {...scaleProps, data: [{x: 1, y: 10}], size: 4},
      context
    );

    expect(context.beginPath).toHaveBeenCalledTimes(2);
    expect(context.stroke).toHaveBeenCalledTimes(2);
    expect(context.arc).toHaveBeenCalledWith(55, 60, 4, 0, 2 * Math.PI);
    expect(context.lineWidth).toBe(1);
  });

  test('skips animation loops when no child requests animation', () => {
    const context = {
      clearRect: vi.fn(),
      scale: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      closePath: vi.fn(),
      setLineDash: vi.fn(),
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1
    } as any;

    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
    const container = document.createElement('div');
    act(() => {
      ReactDOM.render(
        <CanvasWrapper
          innerWidth={100}
          innerHeight={50}
          marginLeft={5}
          marginRight={10}
          marginTop={10}
          marginBottom={15}
          pixelRatio={1}
        >
          <LineSeriesCanvas
            {...scaleProps}
            data={[{x: 0, y: 0}, {x: 2, y: 20}]}
            strokeWidth={2}
          />
        </CanvasWrapper>,
        container
      );
      ReactDOM.unmountComponentAtNode(container);
    });

    expect(context.clearRect).toHaveBeenCalled();
  });
});
