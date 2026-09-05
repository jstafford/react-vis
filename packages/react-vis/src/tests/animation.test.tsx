import {describe, expect, test, vi} from 'vitest';
import React from 'react';
import ReactDOM from 'react-dom';
import {act} from 'react-dom/test-utils';
import {renderToStaticMarkup} from 'react-dom/server';
import Animation, {extractAnimatedPropValues} from '../animation';

describe('Animation', () => {
  test('extracts only declared animated properties', () => {
    expect(
      extractAnimatedPropValues({
        animatedProps: ['x', 'y'],
        x: 10,
        y: 20,
        ignored: 'value'
      })
    ).toEqual({x: 10, y: 20});
  });

  test('renders its child through the motion wrapper', () => {
    const markup = renderToStaticMarkup(
      <Animation animatedProps={[]} animation={false}>
        <span>Animated child</span>
      </Animation>
    );

    expect(markup).toContain('Animated child');
  });

  test('falls back gracefully for invalid string presets and updates on rerender', () => {
    const onStart = vi.fn();
    const onEnd = vi.fn();
    const invalidPreset = renderToStaticMarkup(
      <Animation animatedProps={[]} animation={'unknown-preset' as any} onStart={onStart} onEnd={onEnd}>
        <span>Fallback child</span>
      </Animation>
    );

    expect(invalidPreset).toContain('Fallback child');

    const container = document.createElement('div');
    act(() => {
      ReactDOM.render(
        <Animation
          animatedProps={['x']}
          animation={false}
          x={0}
          onStart={onStart}
          onEnd={onEnd}
        >
          <span>x</span>
        </Animation>,
        container
      );
    });
    act(() => {
      ReactDOM.render(
        <Animation
          animatedProps={['x']}
          animation={false}
          x={1}
          onStart={onStart}
          onEnd={onEnd}
        >
          <span>x</span>
        </Animation>,
        container
      );
    });

    expect(onStart).toHaveBeenCalledTimes(1);
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
  });
});
