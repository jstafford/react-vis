import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import GridLines from '../grid-lines';
import CircularGridLines from '../circular-grid-lines';
import HorizontalGridLines from '../horizontal-grid-lines';
import VerticalGridLines from '../vertical-grid-lines';

const scaleProps = {
  xRange: [0, 100],
  xDomain: [0, 10],
  xType: 'linear',
  yRange: [80, 0],
  yDomain: [0, 10],
  yType: 'linear',
  innerWidth: 100,
  innerHeight: 80,
  marginLeft: 10,
  marginRight: 5,
  marginTop: 8,
  marginBottom: 7
};

describe('GridLines', () => {
  test('renders vertical and horizontal grids with explicit ticks', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <VerticalGridLines {...scaleProps} tickValues={[0, 5, 10]} />
        <HorizontalGridLines {...scaleProps} tickValues={[0, 10]} />
      </svg>
    );

    expect(markup.match(/rv-xy-plot__grid-lines__line/g)).toHaveLength(5);
    expect(markup).toContain('translate(10,8)');
    expect(markup).toContain('x2="100"');
    expect(markup).toContain('y2="80"');
  });

  test('filters circular grid radii using rRange', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <CircularGridLines
          {...scaleProps}
          centerX={5}
          centerY={5}
          tickValues={[0, 5, 10]}
          rRange={[20, 60]}
        />
      </svg>
    );

    expect(markup).toContain('rv-xy-plot__circular-grid-lines');
    expect(markup.match(/rv-xy-plot__circular-grid-lines__line/g)).toHaveLength(1);
    expect(markup).toContain('translate(60,48)');
  });
});
