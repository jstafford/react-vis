import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import VerticalBarSeries from '../vertical-bar-series';
import LabelSeries from '../label-series';
import WhiskerSeries from '../whisker-series';

const scaleProps = {
  xRange: [0, 100],
  xDomain: [0, 2],
  xType: 'linear',
  yRange: [100, 0],
  yDomain: [0, 20],
  yType: 'linear',
  marginLeft: 5,
  marginTop: 10
};

describe('bar, label, and whisker series', () => {
  test('renders a vertical bar with a zero baseline', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <VerticalBarSeries
          {...scaleProps}
          data={[{x: 1, y: 10}]}
          color="steelblue"
        />
      </svg>
    );

    expect(markup).toContain('rv-xy-plot__series--bar');
    expect(markup).toContain('<rect');
    expect(markup).toContain('fill:steelblue');
  });

  test('renders labels and skips empty labels', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <LabelSeries
          {...scaleProps}
          xRange={[0, 100]}
          yRange={[100, 0]}
          data={[
            {x: 0, y: 0, label: 'left', xOffset: 4, yOffset: 3},
            {x: 1, y: 10, label: ''}
          ]}
          allowOffsetToBeReversed
          rotation={15}
        />
      </svg>
    );

    expect(markup.match(/rv-xy-plot__series--label-text/g)).toHaveLength(1);
    expect(markup).toContain('>left</text>');
    expect(markup).toContain('rotate(15,');
  });

  test('renders horizontal and vertical whiskers for variance', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <WhiskerSeries
          {...scaleProps}
          data={[{x: 1, y: 10, xVariance: 1, yVariance: 4}]}
          size={2}
          stroke="black"
        />
      </svg>
    );

    expect(markup).toContain('rv-xy-plot__series--whisker');
    expect(markup).toContain('class="x-whiskers"');
    expect(markup).toContain('class="y-whiskers"');
    expect(markup.match(/<line/g)).toHaveLength(8);
  });
});
