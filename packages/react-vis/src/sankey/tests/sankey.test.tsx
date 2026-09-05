import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import Sankey from '../index';

const nodes = [{name: 'Source'}, {name: 'Target'}];
const links = [{source: 0, target: 1, value: 10}];
const props = {
  width: 240,
  height: 160,
  nodes,
  links,
  strokeWidth: 2
};

describe('Sankey', () => {
  test('renders its empty-node XYPlot fallback', () => {
    const markup = renderToStaticMarkup(
      <Sankey {...props} nodes={[]} links={[]} />
    );

    expect(markup).toContain('rv-sankey');
    expect(markup).not.toContain('rv-sankey__link');
  });

  test('renders links, nodes, labels, and children', () => {
    const markup = renderToStaticMarkup(
      <Sankey {...props}>
        <g className="custom-child" />
      </Sankey>
    );

    expect(markup).toContain('rv-sankey__link');
    expect(markup).toContain('rv-sankey__node');
    expect(markup).toContain('>Source</text>');
    expect(markup).toContain('>Target</text>');
    expect(markup).toContain('custom-child');
  });

  test('supports hidden labels and Voronoi mode', () => {
    const markup = renderToStaticMarkup(
      <Sankey {...props} hideLabels hasVoronoi />
    );

    expect(markup).not.toContain('>Source</text>');
    expect(markup).toContain('rv-sankey__voronoi');
  });

  test('handles alignment and custom style callbacks on links', () => {
    const onLinkClick = vi.fn();
    const markup = renderToStaticMarkup(
      <Sankey
        {...props}
        align="left"
        labelRotation={90}
        style={{links: {strokeDasharray: '4, 2'}, labels: {fontSize: 11}}}
        onLinkClick={onLinkClick}
      />
    );

    expect(markup).toContain('stroke-dasharray="4, 2"');
    expect(markup).toContain('font-size="11"');
    expect(onLinkClick).not.toHaveBeenCalled();
  });
});
