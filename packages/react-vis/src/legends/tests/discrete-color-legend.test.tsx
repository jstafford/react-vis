import {describe, expect, test, vi} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import DiscreteColorLegend from '../discrete-color-legend';

describe('DiscreteColorLegend', () => {
  test('normalizes string, object, and element items', () => {
    const markup = renderToStaticMarkup(
      <DiscreteColorLegend
        orientation="horizontal"
        colors={['red', 'blue']}
        items={[
          'First',
          {title: 'Second', color: 'green', disabled: true},
          <strong key="third">Third</strong>
        ]}
        width={240}
        height={80}
      />
    );

    expect(markup).toContain('rv-discrete-color-legend horizontal');
    expect(markup).toContain('width:240px;height:80px');
    expect(markup).toContain('>First</span>');
    expect(markup).toContain('>Second</span>');
    expect(markup).toContain('<strong>Third</strong>');
    expect(markup).toContain('stroke:red');
    expect(markup).toContain('disabled');
  });

  test('passes the item and index to click handlers', () => {
    const onItemClick = vi.fn();
    const markup = renderToStaticMarkup(
      <DiscreteColorLegend items={['First']} onItemClick={onItemClick} />
    );

    expect(markup).toContain('>First</span>');
    expect(onItemClick).not.toHaveBeenCalled();
  });
});
