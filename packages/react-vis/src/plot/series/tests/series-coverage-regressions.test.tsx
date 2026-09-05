import {describe, expect, test, vi} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';

import ArcSeries from '../arc-series';
import HeatmapSeries from '../heatmap-series';
import HorizontalBarSeries from '../horizontal-bar-series';
import HorizontalBarSeriesCanvas from '../horizontal-bar-series-canvas';
import HorizontalRectSeries from '../horizontal-rect-series';
import HorizontalRectSeriesCanvas from '../horizontal-rect-series-canvas';
import LineMarkSeries from '../line-mark-series';
import LineMarkSeriesCanvas from '../line-mark-series-canvas';
import MarkSeries from '../mark-series';
import RectSeries from '../rect-series';
import VerticalBarSeries from '../vertical-bar-series';
import VerticalBarSeriesCanvas from '../vertical-bar-series-canvas';
import VerticalRectSeries from '../vertical-rect-series';
import VerticalRectSeriesCanvas from '../vertical-rect-series-canvas';
import WhiskerSeries from '../whisker-series';

const scaleProps = {
  xRange: [0, 100],
  xDomain: [0, 2],
  xType: 'linear',
  yRange: [100, 0],
  yDomain: [0, 20],
  yType: 'linear',
  marginLeft: 5,
  marginTop: 10,
  color: 'steelblue'
};

const barData = [{x: 1, y: 10}];
const rectData = [{x: 1, y: 10, x0: 0, y0: 0}];

describe('series coverage regressions', () => {
  test('renders arc series with default scaling and animation wrapper', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <ArcSeries
          {...scaleProps}
          data={[{radius: 20, angle: Math.PI / 2, angle0: 0}]}
          innerWidth={200}
          innerHeight={200}
          center={{x: 0, y: 0}}
          animation
        />
      </svg>
    );

    expect(markup).toContain('rv-xy-plot__series--arc');
    expect(markup).toContain('<path');
  });

  test('renders heatmap and exposes domain config', () => {
    expect(HeatmapSeries.getParentConfig('x')).toEqual({isDomainAdjustmentNeeded: true});

    const markup = renderToStaticMarkup(
      <svg>
        <HeatmapSeries
          {...scaleProps}
          data={[{x: 0, y: 0}, {x: 1, y: 10}]}
          style={{rectStyle: {rx: 2}} as any}
        />
      </svg>
    );

    expect(markup).toContain('rv-xy-plot__series--heatmap');
    expect(markup).toContain('rx="2"');
  });

  test('renders horizontal and vertical series wrappers', () => {
    const horizontalBar = renderToStaticMarkup(
      <svg><HorizontalBarSeries {...scaleProps} data={barData} /></svg>
    );
    const verticalBar = renderToStaticMarkup(
      <svg><VerticalBarSeries {...scaleProps} data={barData} /></svg>
    );
    const horizontalRect = renderToStaticMarkup(
      <svg><HorizontalRectSeries {...scaleProps} data={rectData} /></svg>
    );
    const verticalRect = renderToStaticMarkup(
      <svg><VerticalRectSeries {...scaleProps} data={rectData} /></svg>
    );

    expect(horizontalBar).toContain('rv-xy-plot__series--bar');
    expect(verticalBar).toContain('rv-xy-plot__series--bar');
    expect(horizontalRect).toContain('rv-xy-plot__series--rect');
    expect(verticalRect).toContain('rv-xy-plot__series--rect');
  });

  test('renders line-mark and whisker series with both branch directions', () => {
    const lineMark = renderToStaticMarkup(
      <svg>
        <LineMarkSeries
          {...scaleProps}
          data={[{x: 0, y: 0}, {x: 1, y: 10}, {x: 2, y: 20}]}
          lineStyle={{stroke: 'red'}}
          markStyle={{fill: 'blue'}}
        />
      </svg>
    );
    const whisker = renderToStaticMarkup(
      <svg>
        <WhiskerSeries
          {...scaleProps}
          data={[{x: 1, y: 10, xVariance: 0.8, yVariance: 4}]}
          size={3}
          stroke="black"
        />
      </svg>
    );

    expect(lineMark).toContain('rv-xy-plot__series--linemark');
    expect(lineMark).toContain('<path');
    expect(lineMark).toContain('<circle');
    expect(whisker).toContain('rv-xy-plot__series--whisker');
    expect(whisker).toContain('class="x-whiskers"');
    expect(whisker).toContain('class="y-whiskers"');
  });

  test('uses null accessor warnings and still renders filtered marks', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const markup = renderToStaticMarkup(
      <svg>
        <MarkSeries
          {...scaleProps}
          data={[{x: 0, y: 0}, {x: 1, y: 10}]}
          nullAccessor={(d: {x: number}) => d.x === 1}
          size={4}
        />
      </svg>
    );

    expect(markup.match(/<circle/g)).toHaveLength(1);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  test('renders rect series through animation and default props', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <RectSeries
          {...scaleProps}
          data={rectData}
          animation
          linePosAttr="x"
          valuePosAttr="y"
          lineSizeAttr="width"
          valueSizeAttr="height"
        />
      </svg>
    );

    expect(markup).toContain('rv-xy-plot__series--rect');
    expect(markup).toContain('<rect');
  });

  test('canvas wrapper classes delegate rendering for both orientations', () => {
    const ctx = {
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

    const barProps = {
      ...scaleProps,
      data: barData,
      opacity: () => 1,
      linePosAttr: 'y',
      valuePosAttr: 'x',
      lineSizeAttr: 'height',
      valueSizeAttr: 'width'
    };
    const rectProps = {
      ...scaleProps,
      data: rectData,
      opacity: () => 1,
      linePosAttr: 'y',
      valuePosAttr: 'x',
      lineSizeAttr: 'height',
      valueSizeAttr: 'width'
    };

    HorizontalBarSeriesCanvas.renderLayer(barProps, ctx);
    VerticalBarSeriesCanvas.renderLayer(
      {...barProps, linePosAttr: 'x', valuePosAttr: 'y', lineSizeAttr: 'width', valueSizeAttr: 'height'},
      ctx
    );
    HorizontalRectSeriesCanvas.renderLayer(rectProps, ctx);
    VerticalRectSeriesCanvas.renderLayer(
      {...rectProps, linePosAttr: 'x', valuePosAttr: 'y', lineSizeAttr: 'width', valueSizeAttr: 'height'},
      ctx
    );
    LineMarkSeriesCanvas.renderLayer(
      {...scaleProps, data: [{x: 0, y: 0}, {x: 1, y: 10}], opacity: () => 1, size: 3},
      ctx
    );

    expect(ctx.rect).toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });
});
