import {afterEach, beforeEach, describe, expect, test, vi} from 'vitest';
import React from 'react';
import ReactDOM from 'react-dom';
import {act} from 'react-dom/test-utils';
import {
  FlexibleHeightXYPlot,
  FlexibleWidthXYPlot,
  FlexibleXYPlot,
  makeHeightFlexible,
  makeVisFlexible,
  makeWidthFlexible
} from '../make-vis-flexible';

describe('make-vis-flexible', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
    vi.useRealTimers();
  });

  test('creates flexible wrappers with the expected display names and props', () => {
    const Example = ({x = 0, y = 0}: {x?: number; y?: number}) => (
      <div data-x={x} data-y={y}>Example</div>
    );

    const WidthOnly = makeWidthFlexible(Example);
    const HeightOnly = makeHeightFlexible(Example);
    const Full = makeVisFlexible(Example);

    expect(WidthOnly.displayName).toBe('FlexibleExample');
    expect(HeightOnly.displayName).toBe('FlexibleExample');
    expect(Full.displayName).toBe('FlexibleExample');
    expect(FlexibleWidthXYPlot.displayName).toBe('FlexibleXYPlot');
    expect(FlexibleHeightXYPlot.displayName).toBe('FlexibleXYPlot');
    expect(FlexibleXYPlot.displayName).toBe('FlexibleXYPlot');
  });

  test('resizes the wrapped component when the container size changes', () => {
    vi.useFakeTimers();

    const Example = ({width, height}: {width?: number; height?: number}) => (
      <div data-width={width} data-height={height}>resized</div>
    );

    const Wrapped = makeVisFlexible(Example);

    act(() => {
      ReactDOM.render(<Wrapped />, container);
    });

    const host = container.firstElementChild as HTMLElement;
    Object.defineProperty(host, 'offsetWidth', {
      configurable: true,
      get: () => 240
    });
    Object.defineProperty(host, 'offsetHeight', {
      configurable: true,
      get: () => 120
    });

    act(() => {
      window.dispatchEvent(new Event('resize'));
      vi.advanceTimersByTime(200);
    });

    expect(container.innerHTML).toContain('data-width="240"');
    expect(container.innerHTML).toContain('data-height="120"');
  });
});
