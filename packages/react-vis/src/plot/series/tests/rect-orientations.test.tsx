import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import HorizontalRectSeries from '../horizontal-rect-series';
import VerticalRectSeries from '../vertical-rect-series';

const commonProps = {
  xRange: [0, 100],
  xDomain: [0, 2],
  xType: 'linear',
  yRange: [100, 0],
  yDomain: [0, 10],
  yType: 'linear',
  data: [{x: 1, y: 5}],
  color: 'steelblue'
};

describe('oriented rect series', () => {
  test.each([
    [VerticalRectSeries, 'vertical-rect'],
    [HorizontalRectSeries, 'horizontal-rect']
  ])('renders %s geometry', (Series, className) => {
    const markup = renderToStaticMarkup(
      <svg><Series {...commonProps} className={className} /></svg>
    );

    expect(markup).toContain(`rv-xy-plot__series--rect ${className}`);
    expect(markup).toContain('<rect');
    expect(markup).toContain('fill:steelblue');
  });
});
