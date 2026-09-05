import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import LineSeries from '../line-series';

const scaleProps = {
  xRange: [0, 100],
  xDomain: [0, 2],
  xType: 'linear',
  yRange: [100, 0],
  yDomain: [0, 20],
  yType: 'linear',
  marginLeft: 10,
  marginTop: 5
};

describe('LineSeries', () => {
  test('renders a scaled SVG path with styling', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <LineSeries
          {...scaleProps}
          data={[{x: 0, y: 0}, {x: 1, y: 10}, {x: 2, y: 20}]}
          color="red"
          strokeStyle="dashed"
          strokeWidth={2}
          className="sales-line"
        />
      </svg>
    );

    expect(markup).toContain('class="rv-xy-plot__series rv-xy-plot__series--line sales-line"');
    expect(markup).toContain('transform="translate(10,5)"');
    expect(markup).toContain('stroke-dasharray:6, 2');
    expect(markup).toContain('stroke:red');
    expect(markup).toContain('d="M0,100L50,50L100,0"');
  });

  test('renders no element when data is null', () => {
    expect(
      renderToStaticMarkup(
        <svg><LineSeries {...scaleProps} data={null as any} /></svg>
      )
    ).toBe('<svg></svg>');
  });
});
