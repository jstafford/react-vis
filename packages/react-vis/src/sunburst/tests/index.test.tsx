import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import Sunburst from '../index';

const data = {
  label: 'root',
  size: 10,
  children: [
    {label: 'A', size: 4, color: 'red'},
    {
      label: 'B',
      children: [
        {label: 'B1', size: 2},
        {label: 'B2', size: 1}
      ]
    }
  ]
};
const props = {width: 300, height: 240, data};

describe('Sunburst', () => {
  test('renders arcs, labels, and the chart container', () => {
    const markup = renderToStaticMarkup(<Sunburst {...props} />);

    expect(markup).toContain('rv-sunburst');
    expect(markup).toContain('rv-sunburst__series--radial__arc');
    expect(markup).toContain('>root</text>');
    expect(markup).toContain('>A</text>');
    expect(markup).toContain('>B1</text>');
    expect(markup).toContain('>B2</text>');
  });

  test('hides the root node and its label', () => {
    const markup = renderToStaticMarkup(
      <Sunburst {...props} hideRootNode />
    );

    expect(markup).not.toContain('>root</text>');
    expect(markup).toContain('>A</text>');
    expect(markup).toContain('rv-sunburst__series--radial__arc');
  });

  test('supports custom size and label accessors', () => {
    const markup = renderToStaticMarkup(
      <Sunburst
        {...props}
        getSize={datum => datum.weight}
        getLabel={datum => `node-${datum.label}`}
        data={{
          label: 'root',
          weight: 5,
          children: [
            {label: 'child', weight: 3, labelStyle: {fill: 'red'}},
            {label: 'other', weight: 2, dontRotateLabel: true}
          ]
        }}
      />
    );

    expect(markup).toContain('>node-root</text>');
    expect(markup).toContain('>node-child</text>');
    expect(markup).toContain('fill="red"');
    expect(markup).toContain('rv-sunburst__series--radial__arc');
  });

  test('passes children through and supports animated listener mapping', () => {
    const markup = renderToStaticMarkup(
      <Sunburst
        {...props}
        animation
        onValueMouseOver={() => {}}
        onValueClick={() => {}}
      >
        <g className="sunburst-child" />
      </Sunburst>
    );

    expect(markup).toContain('sunburst-child');
    expect(markup).toContain('rv-sunburst__series--radial__arc');
  });

  test('handles an empty tree', () => {
    const markup = renderToStaticMarkup(
      <Sunburst
        {...props}
        hideRootNode
        data={{label: 'empty', children: []}}
      />
    );

    expect(markup).toContain('rv-sunburst');
    expect(markup).not.toContain('>empty</text>');
  });
});
