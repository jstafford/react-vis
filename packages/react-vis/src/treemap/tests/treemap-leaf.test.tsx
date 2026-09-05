import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import TreemapLeaf from '../treemap-leaf';

const node = {
  data: {title: 'Revenue'},
  title: 'Revenue'
} as any;
const scales = {
  color: () => '#ffffff',
  opacity: () => 0.8
} as any;

describe('TreemapLeaf', () => {
  test('renders a rectangular leaf and merged styles', () => {
    const markup = renderToStaticMarkup(
      <TreemapLeaf
        node={node}
        scales={scales}
        x0={10}
        x1={90}
        y0={20}
        y1={60}
        r={15}
        width={100}
        height={80}
        style={{fontSize: 12}}
      />
    );

    expect(markup).toContain('class="rv-treemap__leaf "');
    expect(markup).toContain('top:20px;left:10px;width:80px;height:40px');
    expect(markup).toContain('font-size:12px');
    expect(markup).toContain('>Revenue</div>');
  });

  test('renders circle packing dimensions and custom labels', () => {
    const markup = renderToStaticMarkup(
      <TreemapLeaf
        node={node}
        scales={scales}
        mode="circlePack"
        getLabel={() => 'Custom'}
        x0={30}
        x1={90}
        y0={40}
        y1={80}
        r={15}
        width={100}
        height={80}
      />
    );

    expect(markup).toContain('rv-treemap__leaf--circle');
    expect(markup).toContain('top:25px;left:15px;width:30px;height:30px');
    expect(markup).toContain('>Custom</div>');
  });
});
