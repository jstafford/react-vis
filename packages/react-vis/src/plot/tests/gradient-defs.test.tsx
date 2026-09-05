import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import GradientDefs from '../gradient-defs';

describe('GradientDefs', () => {
  test('renders its class name and children', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <GradientDefs className="custom-gradient">
          <linearGradient id="gradient-one" />
        </GradientDefs>
      </svg>
    );

    expect(markup).toContain('class="rv-gradient-defs custom-gradient"');
    expect(markup).toContain('id="gradient-one"');
  });
});
