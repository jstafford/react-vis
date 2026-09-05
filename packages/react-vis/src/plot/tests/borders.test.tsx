import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import Borders from '../borders';

describe('Borders', () => {
  test('renders four border rectangles with shared and individual styles', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <Borders
          innerWidth={100}
          innerHeight={50}
          marginTop={5}
          marginBottom={10}
          marginLeft={15}
          marginRight={20}
          className="chart-border"
          style={{
            all: {fill: 'none'},
            bottom: {stroke: 'red'}
          }}
        />
      </svg>
    );

    expect(markup.match(/<rect/g)).toHaveLength(4);
    expect(markup).toContain('rv-xy-plot__borders chart-border');
    expect(markup).toContain('chart-border-bottom');
    expect(markup).toContain('fill:none;stroke:red');
    expect(markup).toContain('width="135"');
    expect(markup).toContain('height="65"');
  });
});
