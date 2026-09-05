import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ContinuousSizeLegend from '../continuous-size-legend';

describe('ContinuousSizeLegend', () => {
  test('renders circles and the configured titles', () => {
    const markup = renderToStaticMarkup(
      <ContinuousSizeLegend
        startTitle={1}
        endTitle={100}
        width={220}
        height={90}
      />
    );

    expect(markup).toContain('rv-continuous-size-legend');
    expect(markup).toContain('rv-bubbles');
    expect(markup).toContain('rv-legend-titles__left');
    expect(markup).toContain('>1</span>');
    expect(markup).toContain('>100</span>');
    expect(markup).toContain('rv-bubble');
    expect(markup).toContain('width:2px;height:2px');
  });
});
