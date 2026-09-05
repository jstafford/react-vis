import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ContentClipPath from '../content-clip-path';

describe('ContentClipPath', () => {
  test('uses the default id and supplied dimensions', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <ContentClipPath innerWidth={120} innerHeight={80} />
      </svg>
    );

    expect(markup).toContain('id="content-area"');
    expect(markup).toContain('width="120"');
    expect(markup).toContain('height="80"');
  });

  test('accepts a custom id', () => {
    expect(
      renderToStaticMarkup(
        <svg><ContentClipPath id="plot-clip" /></svg>
      )
    ).toContain('id="plot-clip"');
  });
});
