import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import Treemap from '../index';

const data = {
  title: 'root',
  children: [
    {title: 'A', size: 2, color: 'red'},
    {title: 'B', size: 1, color: 'blue'}
  ]
};
const props = {width: 200, height: 120, padding: 1, data};

describe('Treemap', () => {
  test('renders the default DOM treemap leaves', () => {
    const markup = renderToStaticMarkup(<Treemap {...props} />);

    expect(markup).toContain('rv-treemap');
    expect(markup).toContain('rv-treemap__leaf');
    expect(markup).toContain('>A</div>');
    expect(markup).toContain('>B</div>');
  });

  test.each(['partition', 'partition-pivot', 'circlePack'] as const)(
    'renders %s layout mode',
    mode => {
      const markup = renderToStaticMarkup(<Treemap {...props} mode={mode} />);
      expect(markup).toContain('rv-treemap');
      expect(markup).toContain('>A</div>');
    }
  );

  test('renders SVG mode and handles empty data', () => {
    const svgMarkup = renderToStaticMarkup(
      <Treemap {...props} renderMode="SVG" hideRootNode />
    );
    const emptyMarkup = renderToStaticMarkup(
      <Treemap {...props} data={{children: []}} />
    );

    expect(svgMarkup).toContain('rv-xy-plot');
    expect(svgMarkup).toContain('rv-treemap__leaf');
    expect(emptyMarkup).toContain('rv-treemap');
  });

  test('renders circle-pack SVG leaves without the root label and honors custom labels', () => {
    const markup = renderToStaticMarkup(
      <Treemap
        {...props}
        mode="circlePack"
        renderMode="SVG"
        getLabel={datum => `${datum.title}-custom`}
        hideRootNode
      />
    );

    expect(markup).toContain('rv-treemap__leaf--circle');
    expect(markup).toContain('rv-xy-plot');
    expect(markup).not.toContain('>root</text>');
  });
});
