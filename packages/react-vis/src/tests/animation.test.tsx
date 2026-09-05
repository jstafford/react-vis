import {describe, expect, test, vi} from 'vitest';
import React from 'react';
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

  test('falls back gracefully for invalid string presets and calls lifecycle hooks', () => {
    const onStart = vi.fn();
    const onEnd = vi.fn();
    const invalidPreset = renderToStaticMarkup(
      <Animation animatedProps={[]} animation={'unknown-preset' as any} onStart={onStart} onEnd={onEnd}>
        <span>Fallback child</span>
      </Animation>
    );

    expect(invalidPreset).toContain('Fallback child');

    const instance = new Animation({
      animatedProps: ['x'],
      animation: false,
      onStart,
      onEnd,
      children: <span>x</span>
    });
    instance._interpolator = (value: number) => ({x: value});
    expect(instance._renderChildren({i: 0.75}).props.x).toBe(0.75);

    instance.componentDidUpdate({animatedProps: ['x'], animation: false, onStart, onEnd});
    expect(onStart).toHaveBeenCalledTimes(1);

    instance._motionEndHandler();
    expect(onEnd).toHaveBeenCalledTimes(1);
  });
});
