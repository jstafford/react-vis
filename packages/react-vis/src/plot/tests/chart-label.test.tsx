import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ChartLabel from '../chart-label';

describe('ChartLabel', () => {
  test('renders text at the requested position with margins', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <ChartLabel
          text="Revenue"
          xPercent={0.5}
          yPercent={0.25}
          innerWidth={100}
          innerHeight={80}
          marginLeft={10}
          marginRight={20}
          marginTop={5}
          marginBottom={15}
          className="custom-label"
          style={{fontSize: 12}}
        />
      </svg>
    );

    expect(markup).toContain('translate(65, 30)');
    expect(markup).toContain('custom-label');
    expect(markup).toContain('>Revenue</text>');
  });
});
