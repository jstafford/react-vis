import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import DiscreteColorLegendItem from '../discrete-color-legend-item';

describe('DiscreteColorLegendItem', () => {
  test('renders clickable disabled and dashed states', () => {
    const markup = renderToStaticMarkup(
      <DiscreteColorLegendItem
        color="red"
        title="Series A"
        orientation="horizontal"
        disabled
        strokeStyle="dashed"
        strokeWidth={3}
        onClick={() => undefined}
      />
    );

    expect(markup).toContain('horizontal disabled clickable');
    expect(markup).toContain('>Series A</span>');
    expect(markup).toContain('stroke-width:3;stroke-dasharray:6, 2');
  });
});
