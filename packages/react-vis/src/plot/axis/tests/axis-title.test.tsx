import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {ORIENTATION} from 'utils/axis-utils';
import AxisTitle from '../axis-title';

describe('AxisTitle', () => {
  test.each([
    [ORIENTATION.LEFT, 'middle', 'translate(200, 0)', 'rotate(-90)'],
    [ORIENTATION.TOP, 'start', 'translate(0, 100)', 'rotate(0)'],
    [ORIENTATION.BOTTOM, 'end', 'translate(0, 0)', 'rotate(0)']
  ])('renders %s orientation and %s position', (orientation, position, outer, rotation) => {
    const markup = renderToStaticMarkup(
      <svg>
        <AxisTitle
          width={200}
          height={100}
          orientation={orientation}
          position={position as 'start' | 'middle' | 'end'}
          title="Revenue"
          style={{fontSize: 14}}
        />
      </svg>
    );

    expect(markup).toContain(`transform="${outer}"`);
    expect(markup).toContain(rotation);
    expect(markup).toContain('>Revenue</text>');
  });
});
