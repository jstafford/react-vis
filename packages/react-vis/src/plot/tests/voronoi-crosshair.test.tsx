import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import Voronoi from '../voronoi';
import Crosshair from '../crosshair';

describe('Voronoi and Crosshair', () => {
  test('renders styled Voronoi cells for nodes', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <Voronoi
          extent={[[0, 0], [100, 100]]}
          nodes={[{x: 20, y: 20, className: 'first', style: {stroke: 'red'}}, {x: 80, y: 80}]}
          polygonStyle={{fill: 'none'}}
        />
      </svg>
    );

    expect(markup.match(/rv-voronoi__cell/g)!.length).toBeGreaterThan(0);
    expect(markup).toContain('fill:none');
  });

  test('renders crosshair title, items, and orientation', () => {
    const markup = renderToStaticMarkup(
      <Crosshair
        values={[{x: 2, y: 10}, {x: 2, y: 20}]}
        xRange={[0, 100]}
        xDomain={[0, 4]}
        xType="linear"
        innerWidth={100}
        innerHeight={80}
        marginLeft={5}
        marginTop={10}
        orientation="left"
      />
    );

    expect(markup).toContain('rv-crosshair');
    expect(markup).toContain('left:55px');
    expect(markup).toContain('rv-crosshair__inner--left');
    expect(markup).toContain('>x</span>: <span');
    expect(markup).toContain('>2</span>');
    expect(markup).toContain('>10</span>');
    expect(markup).toContain('>20</span>');
  });

  test('renders nothing without a value', () => {
    expect(renderToStaticMarkup(<Crosshair values={[]} />)).toBe('');
  });
});
