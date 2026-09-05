import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import AreaSeries from '../area-series';
import MarkSeries from '../mark-series';
import PolygonSeries from '../polygon-series';

const scaleProps = {
  xRange: [0, 100],
  xDomain: [0, 2],
  xType: 'linear',
  yRange: [100, 0],
  yDomain: [0, 20],
  yType: 'linear',
  marginLeft: 5,
  marginTop: 10,
  color: 'red'
};

describe('shape series', () => {
  test('renders marks and filters null rows', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <MarkSeries
          {...scaleProps}
          data={[{x: 0, y: 0}, {x: 1, y: 10}]}
          getNull={(row: {y: number}) => row.y !== 0}
          size={4}
        />
      </svg>
    );

    expect(markup.match(/<circle/g)).toHaveLength(1);
    expect(markup).toContain('cx="50"');
    expect(markup).toContain('cy="50"');
    expect(markup).toContain('r="4"');
  });

  test('renders an area and polygon path', () => {
    const data = [{x: 0, y: 0}, {x: 1, y: 10}, {x: 2, y: 20}];
    const markup = renderToStaticMarkup(
      <svg>
        <AreaSeries {...scaleProps} data={data} />
        <PolygonSeries {...scaleProps} data={data} color="green" />
      </svg>
    );

    expect(markup).toContain('rv-xy-plot__series--line');
    expect(markup).toContain('rv-xy-plot__series--polygon');
    expect(markup).toContain('fill="green"');
    expect(markup).toContain('M0 100 L50 50 L100 0 Z');
  });
});
