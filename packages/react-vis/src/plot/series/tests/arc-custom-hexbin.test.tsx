import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ArcSeries from '../arc-series';
import CustomSVGSeries from '../custom-svg-series';
import HexbinSeries from '../hexbin-series';

const xyProps = {
  xRange: [0, 100],
  xDomain: [-1, 1],
  xType: 'linear',
  yRange: [100, 0],
  yDomain: [-1, 1],
  yType: 'linear',
  marginLeft: 5,
  marginTop: 10
};

describe('arc, custom SVG, and hexbin series', () => {
  test('renders an arc path from polar data', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <ArcSeries
          {...xyProps}
          radiusRange={[0, 40]}
          radiusDomain={[0, 10]}
          angleType="literal"
          data={[{radius0: 0, radius: 10, angle0: 0, angle: Math.PI / 2}]}
          color="red"
        />
      </svg>
    );

    expect(markup).toContain('rv-xy-plot__series--arc-path');
    expect(markup).toContain('fill:red');
    expect(markup).toContain('d="');
  });

  test('renders built-in and custom SVG marks', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <CustomSVGSeries
          {...xyProps}
          innerWidth={100}
          innerHeight={100}
          size={10}
          data={[{x: 0, y: 0, customComponent: 'square'}, {x: 1, y: 1, customComponent: 'circle'}]}
        />
      </svg>
    );

    expect(markup).toContain('rv-xy-plot__series--custom-svg-wrapper');
    expect(markup).toContain('<rect');
    expect(markup).toContain('<circle');
  });

  test('renders occupied hexbin paths', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <HexbinSeries
          {...xyProps}
          innerWidth={100}
          innerHeight={100}
          radius={10}
          data={[{x: -1, y: -1}, {x: -1, y: -1}, {x: 1, y: 1}]}
        />
      </svg>
    );

    expect(markup).toContain('rv-xy-plot__series--hexbin');
    expect(markup.match(/<path/g)).toHaveLength(2);
  });
});
