import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import RadialChart from '../index';

const data = [
  {angle: 1, label: 'one', color: 'red'},
  {angle: 2, label: 'two', subLabel: 'second', color: 'blue'},
  {angle: 3, label: 'three'}
];
const props = {width: 300, height: 240, data};

describe('RadialChart', () => {
  test('renders pie slices and labels', () => {
    const markup = renderToStaticMarkup(
      <RadialChart {...props} showLabels />
    );

    expect(markup).toContain('rv-radial-chart');
    expect(markup).toContain('rv-radial-chart__series--pie__slice');
    expect(markup).toContain('>one</text>');
    expect(markup).toContain('>two</text>');
    expect(markup).toContain('>three</text>');
    expect(markup).toContain('>second</text>');
  });

  test('omits labels when showLabels is false and renders children', () => {
    const markup = renderToStaticMarkup(
      <RadialChart {...props} showLabels={false}>
        <g className="radial-child" />
      </RadialChart>
    );

    expect(markup).not.toContain('>one</text>');
    expect(markup).not.toContain('>second</text>');
    expect(markup).toContain('radial-child');
  });

  test('supports custom label accessors and labels above children', () => {
    const markup = renderToStaticMarkup(
      <RadialChart
        {...props}
        showLabels
        labelsAboveChildren
        labelsRadiusMultiplier={1.4}
        getLabel={datum => `label-${datum.color || datum.angle}`}
        getSubLabel={datum => `sub-${datum.angle}`}
        labelsStyle={{fontSize: 12}}
      >
        <g className="radial-child" />
      </RadialChart>
    );

    expect(markup).toContain('>label-red</text>');
    expect(markup).toContain('>sub-3.141592653589793</text>');
    expect(markup).toContain('font-size="10"');
    expect(markup).toContain('radial-child');
  });

  test('uses an explicit radius and inner radius', () => {
    const markup = renderToStaticMarkup(
      <RadialChart {...props} radius={90} innerRadius={30} />
    );

    expect(markup).toContain('rv-radial-chart__series--pie__slice');
    expect(markup).toContain('d="');
  });

  test('handles empty data and custom chart props', () => {
    const markup = renderToStaticMarkup(
      <RadialChart
        {...props}
        data={[]}
        className="custom-radial"
        margin={{top: 4}}
        colorType="literal"
      />
    );

    expect(markup).toContain('custom-radial rv-radial-chart');
    expect(markup).not.toContain('rv-radial-chart__series--pie__slice');
  });
});
