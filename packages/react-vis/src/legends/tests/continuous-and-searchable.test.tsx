import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ContinuousColorLegend from '../continuous-color-legend';
import SearchableDiscreteColorLegend from '../searchable-discrete-color-legend';

describe('legend variants', () => {
  test('renders a continuous gradient with an optional midpoint', () => {
    const markup = renderToStaticMarkup(
      <ContinuousColorLegend
        startColor="red"
        midColor="yellow"
        endColor="blue"
        startTitle="Low"
        midTitle="Middle"
        endTitle="High"
      />
    );

    expect(markup).toContain('linear-gradient(to right, red,yellow,blue)');
    expect(markup).toContain('>Low</span>');
    expect(markup).toContain('>Middle</span>');
    expect(markup).toContain('>High</span>');
  });

  test('filters searchable legend items', () => {
    const markup = renderToStaticMarkup(
      <SearchableDiscreteColorLegend
        searchText="alpha"
        searchPlaceholder="Search"
        items={['Alpha', 'Beta']}
      />
    );

    expect(markup).toContain('placeholder="Search"');
    expect(markup).toContain('>Alpha</span>');
    expect(markup).not.toContain('>Beta</span>');
  });
});
