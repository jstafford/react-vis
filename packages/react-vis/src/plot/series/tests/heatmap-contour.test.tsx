import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import HeatmapSeries from '../heatmap-series';
import ContourSeries from '../contour-series';

const scaleProps = {
  xRange: [0, 100],
  xDomain: [0, 2],
  xType: 'linear',
  yRange: [100, 0],
  yDomain: [0, 2],
  yType: 'linear',
  marginLeft: 5,
  marginTop: 10,
  color: 'red'
};

describe('HeatmapSeries and ContourSeries', () => {
  test('renders one scaled rectangle per heatmap datum', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <HeatmapSeries
          {...scaleProps}
          data={[{x: 0, y: 0}, {x: 2, y: 2}]}
          style={{rectStyle: {rx: 2}} as any}
        />
      </svg>
    );

    expect(markup.match(/<rect/g)).toHaveLength(2);
    expect(markup).toContain('transform="translate(5,10)"');
    expect(markup).toContain('rx="2"');
    expect(markup).toContain('fill:red');
  });

  test('returns null when contour dimensions are unavailable', () => {
    expect(
      renderToStaticMarkup(
        <svg><ContourSeries {...scaleProps} data={[]} /></svg>
      )
    ).toBe('<svg></svg>');
  });

  test('renders contour paths for valid data and dimensions', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <ContourSeries
          {...scaleProps}
          innerWidth={100}
          innerHeight={100}
          data={[{x: 0, y: 0}, {x: 1, y: 1}, {x: 2, y: 2}]}
          bandwidth={10}
        />
      </svg>
    );

    expect(markup).toContain('rv-xy-plot__series--contour');
    expect(markup).toContain('rv-xy-plot__series--contour-line');
  });
});
