import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ORIENTATION} from 'utils/axis-utils';
import AxisLine from '../axis-line';

describe('AxisLine', () => {
  test.each([
    [ORIENTATION.LEFT, 'x1="100"', 'y2="50"'],
    [ORIENTATION.RIGHT, 'x1="0"', 'y2="50"'],
    [ORIENTATION.TOP, 'x2="100"', 'y1="50"'],
    [ORIENTATION.BOTTOM, 'x2="100"', 'y1="0"']
  ])('renders the %s orientation', (orientation, firstAttribute, secondAttribute) => {
    const markup = renderToStaticMarkup(
      <svg>
        <AxisLine orientation={orientation} width={100} height={50} />
      </svg>
    );

    expect(markup).toContain('class="rv-xy-plot__axis__line"');
    expect(markup).toContain(firstAttribute);
    expect(markup).toContain(secondAttribute);
  });
});
