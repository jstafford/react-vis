import {describe, expect, test} from 'vitest';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import Hint from '../hint';

const scaleProps = {
  xRange: [0, 100],
  xDomain: [0, 100],
  xType: 'linear',
  yRange: [80, 0],
  yDomain: [0, 80],
  yType: 'linear',
  innerWidth: 100,
  innerHeight: 80,
  marginLeft: 10,
  marginRight: 5,
  marginTop: 5,
  marginBottom: 5
};

describe('Hint', () => {
  test('renders the default formatted summary and auto-alignment classes', () => {
    const markup = renderToStaticMarkup(
      <Hint
        {...scaleProps}
        value={{x: 40, y: 30}}
      />
    );

    expect(markup).toContain('rv-hint');
    expect(markup).toContain('rv-hint--horizontalAlign-right');
    expect(markup).toContain('rv-hint--verticalAlign-top');
    expect(markup).toContain('>x</span>');
    expect(markup).toContain('>y</span>');
    expect(markup).toContain('>40</span>');
    expect(markup).toContain('>30</span>');
  });

  test('supports custom orientation, child content, and explicit position styling', () => {
    const markup = renderToStaticMarkup(
      <Hint
        {...scaleProps}
        orientation={Hint.ORIENTATION.TOP_LEFT}
        value={{x: 5, y: 10}}
      >
        <span className="custom-hint">Top left</span>
      </Hint>
    );

    expect(markup).toContain('rv-hint--orientation-topleft');
    expect(markup).toContain('custom-hint');
    expect(markup).toContain('>Top left</span>');
  });
});
