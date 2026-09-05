import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import ParallelCoordinates from '../index';

const domains = [
  {name: 'speed', domain: [0, 100]},
  {name: 'power', domain: [0, 100]},
  {name: 'comfort', domain: [0, 100]}
];
const data = [
  {name: 'Alpha', speed: 80, power: 60, comfort: 90, color: 'red'},
  {name: 'Beta', speed: 40, power: 75, comfort: 55, color: 'blue'}
];
const props = {width: 360, height: 240, domains, data};

describe('ParallelCoordinates', () => {
  test('renders axes, lines, labels, and the chart container', () => {
    const markup = renderToStaticMarkup(
      <ParallelCoordinates {...props} />
    );

    expect(markup).toContain('rv-parallel-coordinates-chart');
    expect(markup).toContain('rv-parallel-coordinates-chart-line');
    expect(markup).toContain('rv-parallel-coordinates-chart-label');
    expect(markup).toContain('>speed</text>');
    expect(markup).toContain('>power</text>');
    expect(markup).toContain('>comfort</text>');
    expect(markup.match(/rv-parallel-coordinates-chart-line/g)).toHaveLength(
      data.length
    );
  });

  test('renders line marks when showMarks is enabled', () => {
    const markup = renderToStaticMarkup(
      <ParallelCoordinates {...props} showMarks />
    );

    expect(markup).toContain('rv-xy-plot__series--linemark');
    expect(markup).toContain('rv-parallel-coordinates-chart-line');
  });

  test('uses custom accessors, tick formatting, row styles, and children', () => {
    const markup = renderToStaticMarkup(
      <ParallelCoordinates
        {...props}
        data={data.map(row => ({
          ...row,
          values: {speed: row.speed, power: row.power, comfort: row.comfort},
          style: {strokeDasharray: '4, 2'}
        }))}
        domains={domains.map(domain => ({
          ...domain,
          getValue: row => row.values[domain.name],
          tickFormat: value => `domain:${value}`
        }))}
        style={{lines: {strokeWidth: 3}, labels: {fontSize: 12}}}
        tickFormat={value => `value:${value}`}
      >
        <g className="parallel-child" />
      </ParallelCoordinates>
    );

    expect(markup).toContain('parallel-child');
    expect(markup).toContain('stroke-width:3');
    expect(markup).toContain('stroke-dasharray:4, 2');
    expect(markup).toContain('font-size="12"');
    expect(markup).toContain('domain:0');
  });

  test('renders brushing highlights for each domain', () => {
    const markup = renderToStaticMarkup(
      <ParallelCoordinates {...props} brushing />
    );

    expect(markup).toContain('rv-mouse-target');
    expect(markup).toContain('rv-highlight-container');
    expect(markup.match(/rv-highlight-container/g)).toHaveLength(
      domains.length
    );
  });

  test('renders an empty data set without line paths', () => {
    const markup = renderToStaticMarkup(
      <ParallelCoordinates {...props} data={[]} />
    );

    expect(markup).toContain('rv-parallel-coordinates-chart');
    expect(markup).not.toContain('rv-parallel-coordinates-chart-line');
  });
});
