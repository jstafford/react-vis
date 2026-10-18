import {act} from 'react-dom/test-utils';
import React from 'react';
import ReactDOM from 'react-dom';
import {describe, expect, test, vi} from 'vitest';
import {Highlight} from '../highlight';

const baseScaleProps = {
  xRange: [0, 100],
  xDomain: [0, 100],
  xType: 'linear',
  yRange: [100, 0],
  yDomain: [0, 100],
  yType: 'linear',
  innerWidth: 100,
  innerHeight: 100,
  marginLeft: 10,
  marginRight: 10,
  marginTop: 10,
  marginBottom: 10
};

const renderInSvg = (child: React.ReactNode): HTMLDivElement => {
  const container = document.createElement('div');
  act(() => {
    ReactDOM.render(<svg>{child}</svg>, container);
  });
  return container;
};

const unmount = (container: HTMLDivElement): void => {
  act(() => {
    ReactDOM.unmountComponentAtNode(container);
  });
};

const dispatchMouseEvent = (target: Element,
  type: string,
  offsetX: number,
  offsetY: number): void => {
  const event = new MouseEvent(type, {bubbles: true});
  Object.defineProperties(event, {
    offsetX: {value: offsetX},
    offsetY: {value: offsetY}
  });
  act(() => {
    target.dispatchEvent(event);
  });
};

describe('Highlight', () => {
  test('renders the mouse target, dimensions, and styles', () => {
    const container = renderInSvg(
      <Highlight
        {...baseScaleProps}
        className="selection"
        color="orange"
        opacity={0.5}
      />
    );

    const target = container.querySelector('.rv-mouse-target');
    const highlight = container.querySelector('.rv-highlight');
    expect(container.querySelector('.selection.rv-highlight-container')).not.toBeNull();
    expect(target?.getAttribute('width')).toBe('120');
    expect(target?.getAttribute('height')).toBe('120');
    expect(highlight?.getAttribute('fill')).toBe('orange');
    expect(highlight?.getAttribute('opacity')).toBe('0.5');
    unmount(container);
  });

  test('supports custom dimensions, highlight coordinates, and default styles', () => {
    const container = renderInSvg(
      <Highlight
        {...baseScaleProps}
        highlightWidth={50}
        highlightHeight={40}
        highlightX={50}
        highlightY={25}
      />
    );

    expect(container.querySelector('.rv-mouse-target')?.getAttribute('width')).toBe('50');
    expect(container.querySelector('.rv-mouse-target')?.getAttribute('height')).toBe('40');
    expect(container.querySelector('.rv-highlight-container')?.getAttribute('transform'))
      .toBe('translate(50, 75)');
    expect(container.querySelector('.rv-highlight')?.getAttribute('opacity')).toBe('0.3');
    expect(container.querySelector('.rv-highlight')?.getAttribute('fill'))
      .toBe('rgb(77, 182, 172)');
    unmount(container);
  });

  test('reports brush start, movement, and completion coordinates', () => {
    const onBrushStart = vi.fn();
    const onBrush = vi.fn();
    const onBrushEnd = vi.fn();
    const container = renderInSvg(
      <Highlight
        {...baseScaleProps}
        onBrushStart={onBrushStart}
        const onBrush ={onBrush}
        onBrushEnd={onBrushEnd}
      />
    );
    const target = container.querySelector('.rv-mouse-target')!;

    dispatchMouseEvent(target, 'mousedown', 20, 30);
    dispatchMouseEvent(target, 'mousemove', 80, 90);
    expect(container.querySelector('.rv-highlight')?.getAttribute('width')).toBe('60');
    dispatchMouseEvent(target, 'mouseup', 80, 90);

    expect(onBrushStart).toHaveBeenCalledTimes(1);
    expect(onBrush).toHaveBeenCalledTimes(1);
    expect(onBrushEnd).toHaveBeenCalledWith(expect.objectContaining({
      left: expect.any(Number),
      right: expect.any(Number),
      top: expect.any(Number),
      bottom: expect.any(Number)
    }));
    unmount(container);
  });

  test('limits brushing to the enabled axis and ignores undersized selections', () => {
    const onBrushEnd = vi.fn();
    const container = renderInSvg(
      <Highlight
        {...baseScaleProps}
        enableX={false}
        enableY
        onBrushEnd={onBrushEnd}
      />
    );
    const target = container.querySelector('.rv-mouse-target')!;

    dispatchMouseEvent(target, 'mousedown', 10, 10);
    dispatchMouseEvent(target, 'mousemove', 12, 12);
    expect(container.querySelector('.rv-highlight')?.getAttribute('width')).toBe('120');
    expect(container.querySelector('.rv-highlight')?.getAttribute('height')).toBe('2');
    dispatchMouseEvent(target, 'mouseup', 12, 12);

    expect(onBrushEnd).toHaveBeenCalledWith(null);
    unmount(container);
  });

  test('moves a selection in drag mode', () => {
    const onDragStart = vi.fn();
    const onDrag = vi.fn();
    const onDragEnd = vi.fn();
    const container = renderInSvg(
      <Highlight
        {...baseScaleProps}
        drag
        onDragStart={onDragStart}
        onDrag={onDrag}
        onDragEnd={onDragEnd}
      />
    );
    const target = container.querySelector('.rv-mouse-target')!;

    dispatchMouseEvent(target, 'mousedown', 10, 10);
    dispatchMouseEvent(target, 'mousemove', 70, 70);
    dispatchMouseEvent(target, 'mouseup', 70, 70);
    dispatchMouseEvent(target, 'mousedown', 30, 30);
    dispatchMouseEvent(target, 'mousemove', 40, 45);
    dispatchMouseEvent(target, 'mouseup', 40, 45);

    expect(onDragStart).toHaveBeenCalledTimes(1);
    expect(onDrag).toHaveBeenCalledTimes(1);
    expect(onDragEnd).toHaveBeenCalledTimes(2);
    unmount(container);
  });
});
