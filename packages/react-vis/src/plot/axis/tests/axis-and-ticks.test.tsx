import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import Axis from '../axis';
import AxisTicks from '../axis-ticks';
import DecorativeAxis from '../decorative-axis';
import DecorativeAxisTicks from '../decorative-axis-ticks';
import XAxis from '../x-axis';
import YAxis from '../y-axis';
import {ORIENTATION} from 'utils/axis-utils';

const scaleProps = {
  xRange: [0, 100],
  xDomain: [0, 10],
  xType: 'linear',
  yRange: [100, 0],
  yDomain: [0, 10],
  yType: 'linear',
  innerWidth: 100,
  innerHeight: 80,
  marginLeft: 20,
  marginRight: 10,
  marginTop: 10,
  marginBottom: 20
};

describe('Axis and AxisTicks', () => {
  test('renders a bottom axis with title and formatted ticks', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <Axis
          {...scaleProps}
          attr="x"
          attrAxis="y"
          title="Months"
          tickValues={[0, 5, 10]}
          tickFormat={value => `M${value}`}
        />
      </svg>
    );

    expect(markup).toContain('rv-xy-plot__axis--horizontal');
    expect(markup).toContain('>Months</text>');
    expect(markup).toContain('>M0</text>');
    expect(markup).toContain('>M10</text>');
    expect(markup.match(/rv-xy-plot__axis__tick"/g)).toHaveLength(3);
  });

  test('supports hidden lines, hidden ticks, and zero-axis placement', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <Axis
          {...scaleProps}
          attr="y"
          attrAxis="x"
          orientation={ORIENTATION.LEFT}
          hideLine
          hideTicks
          on0
        />
      </svg>
    );

    expect(markup).toContain('rv-xy-plot__axis--vertical');
    expect(markup).not.toContain('rv-xy-plot__axis__line');
    expect(markup).not.toContain('rv-xy-plot__axis__ticks');
    expect(markup).toContain('translate(0,10)');
  });

  test('renders top tick labels with angle and custom line styles', () => {
    const markup = renderToStaticMarkup(
      <svg>
        <AxisTicks
          {...scaleProps}
          attr="x"
          orientation={ORIENTATION.TOP}
          width={100}
          height={80}
          tickValues={[0, 10]}
          tickLabelAngle={45}
          tickSize={4}
          style={{line: {stroke: 'red'}, text: {fill: 'blue'}}}
        />
      </svg>
    );

    expect(markup).toContain('translate(0, 80)');
    expect(markup).toContain('rotate(45)');
    expect(markup).toContain('stroke:red');
    expect(markup).toContain('fill:blue');
  });

  test('renders x/y axis wrappers with their default orientations', () => {
    const xMarkup = renderToStaticMarkup(
      <svg>
        <XAxis
          {...scaleProps}
          attr="x"
          attrAxis="y"
          title="X axis"
          tickValues={[0, 5, 10]}
        />
      </svg>
    );
    const yMarkup = renderToStaticMarkup(
      <svg>
        <YAxis
          {...scaleProps}
          attr="y"
          attrAxis="x"
          title="Y axis"
          tickValues={[0, 5, 10]}
        />
      </svg>
    );

    expect(xMarkup).toContain('rv-xy-plot__axis--horizontal');
    expect(yMarkup).toContain('rv-xy-plot__axis--vertical');
    expect(xMarkup).toContain('>X axis</text>');
    expect(yMarkup).toContain('>Y axis</text>');
  });

  test('renders decorative axes and decorative ticks with default formatting', () => {
    const axisMarkup = renderToStaticMarkup(
      <svg>
        <DecorativeAxis
          {...scaleProps}
          axisDomain={[0, 10]}
          axisStart={{x: 0, y: 0}}
          axisEnd={{x: 100, y: 60}}
          numberOfTicks={3}
          tickValue={value => `${value}`}
          tickSize={5}
          style={{line: {stroke: 'black'}, text: {fontSize: 10}, ticks: {stroke: 'green'}}}
        />
      </svg>
    );

    const ticksMarkup = renderToStaticMarkup(
      <svg>
        <g>
          {DecorativeAxisTicks({
            axisDomain: [0, 10],
            axisStart: {x: 0, y: 0},
            axisEnd: {x: 100, y: 60},
            numberOfTicks: 3,
            tickValue: value => `${value}`,
            tickSize: 5,
            style: {line: {}, ticks: {stroke: 'green'}, text: {fontSize: 10}}
          })}
        </g>
      </svg>
    );

    expect(axisMarkup).toContain('rv-xy-manipulable-axis');
    expect(axisMarkup).toContain('class="rv-xy-plot__axis__line"');
    expect(ticksMarkup).toContain('rv-xy-plot__axis__tick');
    expect(ticksMarkup).toContain('font-size="10"');
  });
});
