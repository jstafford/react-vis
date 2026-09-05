import {describe, expect, test, vi} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import RadarChart from '../index';

const domains = [
  {name: 'speed', domain: [0, 100]},
  {name: 'power', domain: [0, 100]},
  {name: 'comfort', domain: [0, 100]}
];
const data = [
  {name: 'Alpha', speed: 80, power: 60, comfort: 90},
  {name: 'Beta', speed: 40, power: 75, comfort: 55}
];
const props = {width: 300, height: 240, domains, data};

describe('RadarChart', () => {
  test('renders axes, labels, polygons, and the chart container', () => {
    const markup = renderToStaticMarkup(<RadarChart {...props} />);

    expect(markup).toContain('rv-radar-chart');
    expect(markup).toContain('rv-radar-chart-polygon');
    expect(markup).toContain('rv-radar-chart-label');
    expect(markup).toContain('speed');
    expect(markup).toContain('power');
    expect(markup).toContain('comfort');
    expect(markup.match(/rv-radar-chart-polygon/g)).toHaveLength(data.length);
  });

  test('renders value points only when value handlers are provided', () => {
    const withoutPoints = renderToStaticMarkup(<RadarChart {...props} />);
    const withPoints = renderToStaticMarkup(
      <RadarChart {...props} onValueMouseOver={vi.fn()} onValueMouseOut={vi.fn()} />
    );

    expect(withoutPoints).not.toContain('rv-radar-chart-polygonPoint');
    expect(withPoints).toContain('rv-radar-chart-polygonPoint');
  });

  test('supports custom value accessors, row colors, and polygon styles', () => {
    const markup = renderToStaticMarkup(
      <RadarChart
        {...props}
        domains={domains.map(domain => ({
          ...domain,
          getValue: row => row.metrics[domain.name]
        }))}
        data={data.map((row, index) => ({
          ...row,
          metrics: {speed: row.speed, power: row.power, comfort: row.comfort},
          color: index === 0 ? 'red' : undefined
        }))}
        style={{polygons: {strokeWidth: 3}}}
      />
    );

    expect(markup).toContain('style="stroke:red;fill:red;stroke-width:3"');
  });

  test('uses domain tick format and can hide innermost values', () => {
    const markup = renderToStaticMarkup(
      <RadarChart
        {...props}
        hideInnerMostValues={false}
        tickFormat={value => `value:${value}`}
        domains={domains.map(domain => ({
          ...domain,
          tickFormat: value => `domain:${value}`
        }))}
      />
    );

    expect(markup).toContain('domain:0');
    expect(markup).toContain('domain:100');
  });

  test('renders axes after polygons and preserves children when requested', () => {
    const markup = renderToStaticMarkup(
      <RadarChart {...props} renderAxesOverPolygons startingAngle={0}>
        <g className="radar-child" />
      </RadarChart>
    );

    expect(markup).toContain('radar-child');
    expect(markup).toContain('rv-radar-chart-polygon');
    expect(markup).toContain('rv-xy-manipulable-axis');
  });
});
